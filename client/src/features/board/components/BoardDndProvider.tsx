import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { TodoCard } from '@/features/board/components/TodoCard';
import { getBoardDragInstructions } from '@/features/board/config/copy';
import { BOARD_STATUSES } from '@/features/board/config/layout';
import { BoardPreviewContext } from '@/features/board/context/BoardPreviewContext';
import { isBoardSortableData, isColumnId, parseColumnId } from '@/features/board/utils/boardContainers';
import {
  findColumn,
  moveBetweenColumns,
  resolveBoardDrop,
  toBoardPreview,
} from '@/features/board/utils/boardDragLogic';
import type { BoardPreview } from '@/features/board/utils/boardDragLogic';
import type { BoardColumns } from '@/features/board/utils/progress';
import { useMoveTodo } from '@/features/todos';
import { REDUCED_MOTION_QUERY } from '@/shared/dnd/config';
import { createDragAnnouncements } from '@/shared/dnd/createDragAnnouncements';
import type { Placement } from '@/shared/dnd/createDragAnnouncements';
import { useDragSensors } from '@/shared/dnd/useDragSensors';
import { STATUS_LABELS } from '@/shared/config/constants';
import type { Todo, TodoStatus } from '@/shared/types/api';

const noop = () => undefined;

/**
 * Local drag state. `ids` is the preview of every column while dragging. After a drop it stays
 * (`committedKey` set) until the optimistic cache update shows up in `columns`, so cards never
 * jump back for a frame between the drop and the cache write.
 */
type DragState = {
  activeTodo: Todo | null;
  origin: TodoStatus;
  ids: BoardPreview;
  committedKey: string | null;
};

type BoardDndProviderProps = {
  projectId: string;
  columns: BoardColumns;
  children: ReactNode;
};

function getColumnsKey(columns: BoardColumns): string {
  return BOARD_STATUSES.map((status) => `${status}:${columns[status].map((todo) => todo.id).join(',')}`).join('|');
}

/**
 * Drag and drop of the board (SPR-5): one `DndContext`, one sortable list per status. Dragging
 * only changes local state (the preview); a drop sends one optimistic `useMoveTodo` mutation.
 */
export function BoardDndProvider({ projectId, columns, children }: BoardDndProviderProps) {
  const moveMutation = useMoveTodo(projectId);
  const isReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const sensors = useDragSensors();
  const [drag, setDrag] = useState<DragState | null>(null);

  const columnsKey = getColumnsKey(columns);
  const todoById = new Map(BOARD_STATUSES.flatMap((status) => columns[status]).map((todo) => [todo.id, todo]));

  // The cache now shows the dropped order (or a rollback): the preview has done its job.
  if (drag !== null && drag.committedKey !== null && drag.committedKey !== columnsKey) {
    setDrag(null);
  }

  /** Pointer first; over a column the card closest to the dragged one wins, an empty column is the target. */
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      const collisions = pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
      const overId = getFirstCollision(collisions, 'id');
      if (overId === null) return [];
      const overKey = String(overId);
      if (isColumnId(overKey)) {
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
    const ids = drag?.ids ?? toBoardPreview(columns);
    const columnId = findColumn(ids, id);
    if (columnId === undefined) return null;
    const listIds = ids[columnId] ?? [];
    const index = listIds.indexOf(id);
    return {
      listLabel: STATUS_LABELS[parseColumnId(columnId)],
      position: index === -1 ? listIds.length : index + 1,
      total: listIds.length,
    };
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    const todo = todoById.get(String(active.id));
    if (!isBoardSortableData(data) || todo === undefined) return;
    setDrag({ activeTodo: todo, origin: parseColumnId(data.columnId), ids: toBoardPreview(columns), committedKey: null });
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (over === null || drag === null) return;
    const activeRect = active.rect.current.translated;
    const isBelowOver = activeRect !== null && activeRect.top > over.rect.top + over.rect.height / 2;
    const next = moveBetweenColumns(drag.ids, String(active.id), String(over.id), isBelowOver);
    if (next !== null) setDrag({ ...drag, ids: next });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (drag === null) return;
    if (over === null) {
      setDrag(null);
      return;
    }
    const result = resolveBoardDrop({
      preview: drag.ids,
      origin: drag.origin,
      activeId: String(active.id),
      overId: String(over.id),
      columns,
    });
    if (result === null) {
      setDrag(null);
      return;
    }
    setDrag({ ...drag, activeTodo: null, committedKey: columnsKey });
    const hasChangedColumn = result.status !== drag.origin;
    moveMutation.mutate(
      {
        todo: result.todo,
        sprintId: result.todo.sprintId,
        status: result.status,
        position: result.position,
        successMessage: hasChangedColumn
          ? `${result.todo.key} moved to ${STATUS_LABELS[result.status]}`
          : `${result.todo.key} moved`,
      },
      // Whatever the outcome, a committed preview never outlives the request.
      { onSettled: () => setDrag((current) => (current?.committedKey === null ? current : null)) },
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{
        announcements: createDragAnnouncements({ getKey, describe }),
        screenReaderInstructions: { draggable: getBoardDragInstructions() },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDrag(null)}
    >
      <BoardPreviewContext.Provider
        value={{ previewIds: drag?.ids ?? null, todoById, isDragging: Boolean(drag?.activeTodo) }}
      >
        {children}
      </BoardPreviewContext.Provider>
      <DragOverlay dropAnimation={isReducedMotion ? null : undefined}>
        {drag?.activeTodo ? (
          <Box component="ul" sx={{ listStyle: 'none' }}>
            <TodoCard todo={drag.activeTodo} onOpen={noop} menuActions={[]} isOverlay />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
