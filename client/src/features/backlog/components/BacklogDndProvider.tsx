import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { DragPreviewContext } from '@/features/backlog/context/DragPreviewContext';
import { isContainerId, isSortableData } from '@/features/backlog/utils/containerIds';
import type { ContainerId } from '@/features/backlog/utils/containerIds';
import {
  createDragAnnouncements,
  SCREEN_READER_INSTRUCTIONS,
} from '@/features/backlog/utils/createDragAnnouncements';
import type { Placement } from '@/features/backlog/utils/createDragAnnouncements';
import {
  findContainer,
  moveBetweenLists,
  resolveDrop,
  toPreviewIds,
} from '@/features/backlog/utils/dragLogic';
import type { ListSource, PreviewIds } from '@/features/backlog/utils/dragLogic';
import { TodoRow, useMoveTodo } from '@/features/todos';
import type { Todo } from '@/shared/types/api';

const POINTER_ACTIVATION_DISTANCE_PX = 5;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const noop = () => undefined;

/**
 * Local drag state. `ids` is the preview of every list while dragging. After a drop it stays
 * (`committedKey` set) until the optimistic cache update shows up in `lists`, so the rows never
 * jump back for a frame between the drop and the cache write.
 */
type DragState = {
  activeTodo: Todo | null;
  origin: ContainerId;
  ids: PreviewIds;
  committedKey: string | null;
};

type BacklogDndProviderProps = {
  projectId: string;
  /** The lists that accept drops right now (collapsed sections and a filtered backlog are not in it). */
  lists: readonly ListSource[];
  getListLabel: (containerId: ContainerId) => string;
  children: ReactNode;
};

function getListsKey(lists: readonly ListSource[]): string {
  return lists
    .map((list) => `${list.containerId}:${list.todos.map((todo) => todo.id).join(',')}`)
    .join('|');
}

/**
 * Drag and drop for the backlog and the planned sprints (BL-5, BL-7): one `DndContext`, one
 * sortable list per container. Dragging only changes local state (the preview); the drop sends
 * one optimistic `useMoveTodo` mutation, never the query cache.
 */
export function BacklogDndProvider({ projectId, lists, getListLabel, children }: BacklogDndProviderProps) {
  const moveMutation = useMoveTodo(projectId);
  const isReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [drag, setDrag] = useState<DragState | null>(null);
  const sensors = useSensors(
    // A few pixels of movement first, so a plain click on the handle never starts a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: POINTER_ACTIVATION_DISTANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const listsKey = getListsKey(lists);
  const todoById = new Map(lists.flatMap((list) => list.todos).map((todo) => [todo.id, todo]));

  // The cache now shows the dropped order (or a rollback): the preview has done its job.
  if (drag !== null && drag.committedKey !== null && drag.committedKey !== listsKey) {
    setDrag(null);
  }

  /**
   * Prefers the item under the pointer; over a list (or empty space of it) the item closest to
   * the dragged one is used, and an empty list is the target itself.
   */
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      const collisions = pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
      const overId = getFirstCollision(collisions, 'id');
      if (overId === null) return [];
      const overKey = String(overId);
      if (isContainerId(overKey)) {
        const itemIds = drag?.ids[overKey] ?? [];
        if (itemIds.length > 0) {
          const closest = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) =>
              itemIds.includes(String(container.id)),
            ),
          });
          const closestId = getFirstCollision(closest, 'id');
          if (closestId !== null) return [{ id: closestId }];
        }
      }
      return [{ id: overId }];
    },
    [drag],
  );

  const getKey = (todoId: string) => todoById.get(todoId)?.key ?? 'todo';
  const describe = (id: string): Placement | null => {
    const ids = drag?.ids ?? toPreviewIds(lists);
    const containerId = findContainer(ids, id);
    if (containerId === undefined) return null;
    const listIds = ids[containerId] ?? [];
    const index = listIds.indexOf(id);
    return {
      listLabel: getListLabel(containerId),
      position: index === -1 ? listIds.length : index + 1,
      total: listIds.length,
    };
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    const todo = todoById.get(String(active.id));
    if (!isSortableData(data) || todo === undefined) return;
    setDrag({ activeTodo: todo, origin: data.containerId, ids: toPreviewIds(lists), committedKey: null });
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (over === null || drag === null) return;
    const activeRect = active.rect.current.translated;
    const isBelowOver = activeRect !== null && activeRect.top > over.rect.top + over.rect.height / 2;
    const next = moveBetweenLists(drag.ids, String(active.id), String(over.id), isBelowOver);
    if (next !== null) setDrag({ ...drag, ids: next });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (drag === null) return;
    // Dropped outside every list: cancelled.
    if (over === null) {
      setDrag(null);
      return;
    }
    const result = resolveDrop({
      preview: drag.ids,
      origin: drag.origin,
      activeId: String(active.id),
      overId: String(over.id),
      lists,
    });
    if (result === null) {
      setDrag(null);
      return;
    }
    setDrag({ ...drag, activeTodo: null, committedKey: listsKey });
    const target = toTargetLabel(result.sprintId, drag.origin);
    moveMutation.mutate(
      {
        ...result,
        successMessage:
          target === null ? `${result.todo.key} moved` : `${result.todo.key} moved to ${target}`,
      },
      // Whatever the outcome, a committed preview never outlives the request. A newer drag in
      // progress (not committed) is left alone.
      { onSettled: () => setDrag((current) => (current?.committedKey === null ? current : null)) },
    );
  };

  /** Name of the list the todo landed in; `null` when it stayed in the same list. */
  const toTargetLabel = (sprintId: string | null, origin: ContainerId): string | null => {
    const containerId = sprintId === null ? 'backlog' : (`sprint:${sprintId}` as const);
    return containerId === origin ? null : getListLabel(containerId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{
        announcements: createDragAnnouncements({ getKey, describe }),
        screenReaderInstructions: { draggable: SCREEN_READER_INSTRUCTIONS },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDrag(null)}
    >
      <DragPreviewContext.Provider value={{ previewIds: drag?.ids ?? null, todoById }}>
        {children}
      </DragPreviewContext.Provider>
      <DragOverlay dropAnimation={isReducedMotion ? null : undefined}>
        {drag?.activeTodo ? (
          <Paper elevation={8} sx={{ overflow: 'hidden' }}>
            <Box component="ul" sx={{ listStyle: 'none' }}>
              <TodoRow
                todo={drag.activeTodo}
                index={0}
                onOpen={noop}
                onDelete={noop}
                hasEnterAnimation={false}
              />
            </Box>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
