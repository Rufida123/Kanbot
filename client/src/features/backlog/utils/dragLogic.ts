import { arrayMove } from '@dnd-kit/sortable';
import { BACKLOG_CONTAINER_ID, isContainerId, parseContainerId } from '@/features/backlog/utils/containerIds';
import type { ContainerId } from '@/features/backlog/utils/containerIds';
import { getTodoPosition } from '@/features/todos';
import type { Todo, TodoStatus } from '@/shared/types/api';

/** Ids of the todos in each droppable list, in display order. Local drag state, never the cache. */
export type PreviewIds = Readonly<Record<string, readonly string[]>>;

export type ListSource = { containerId: ContainerId; todos: readonly Todo[] };

/** Where the dragged todo is now: the list that holds its id, or the list the id names. */
export function findContainer(preview: PreviewIds, id: string): ContainerId | undefined {
  if (isContainerId(id) && id in preview) return id;
  return Object.keys(preview).find((key) => preview[key]?.includes(id)) as ContainerId | undefined;
}

export function toPreviewIds(lists: readonly ListSource[]): PreviewIds {
  return Object.fromEntries(lists.map((list) => [list.containerId, list.todos.map((todo) => todo.id)]));
}

/**
 * Cross-list preview while dragging: the active id leaves its list and enters the list under
 * the pointer, before or after the item it hovers. `null` = nothing to change.
 */
export function moveBetweenLists(
  preview: PreviewIds,
  activeId: string,
  overId: string,
  isBelowOver: boolean,
): PreviewIds | null {
  const from = findContainer(preview, activeId);
  const to = findContainer(preview, overId);
  if (from === undefined || to === undefined || from === to) return null;
  const fromIds = preview[from] ?? [];
  const toIds = preview[to] ?? [];
  const overIndex = toIds.indexOf(overId);
  const insertAt = overIndex === -1 ? toIds.length : overIndex + (isBelowOver ? 1 : 0);
  return {
    ...preview,
    [from]: fromIds.filter((id) => id !== activeId),
    [to]: [...toIds.slice(0, insertAt), activeId, ...toIds.slice(insertAt)],
  };
}

export type DropResult = {
  todo: Todo;
  sprintId: string | null;
  status: TodoStatus | undefined;
  /** Index in the target list after removing the todo (inside its status column for sprints). */
  position: number;
};

/** Status of a todo dropped into a planned sprint from another list (the plan's example). */
export const STATUS_AFTER_MOVE_INTO_SPRINT: TodoStatus = 'todo';

/**
 * The single request a drop means, or `null` when nothing changed (same list, same position).
 * `preview` is the state at drop time; `overId` is the item or list under the dragged todo.
 */
export function resolveDrop(params: {
  preview: PreviewIds;
  origin: ContainerId;
  activeId: string;
  overId: string;
  lists: readonly ListSource[];
}): DropResult | null {
  const { preview, origin, activeId, overId, lists } = params;
  const target = findContainer(preview, activeId);
  const todo = lists.flatMap((list) => list.todos).find((item) => item.id === activeId);
  if (target === undefined || todo === undefined) return null;

  let ids = preview[target] ?? [];
  if (overId !== activeId && findContainer(preview, overId) === target && !isContainerId(overId)) {
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1) ids = arrayMove([...ids], oldIndex, newIndex);
  }

  const isTargetSprint = target !== BACKLOG_CONTAINER_ID;
  const changesList = target !== origin;
  const status = changesList && isTargetSprint ? STATUS_AFTER_MOVE_INTO_SPRINT : undefined;
  const todosById = new Map(lists.flatMap((list) => list.todos).map((item) => [item.id, item]));
  const finalTodos = ids.flatMap((id) => {
    const item = id === activeId ? { ...todo, status: status ?? todo.status } : todosById.get(id);
    return item === undefined ? [] : [item];
  });
  const position = getTodoPosition(finalTodos, activeId, isTargetSprint);
  if (position === -1) return null;

  if (!changesList) {
    const originalList = lists.find((list) => list.containerId === origin)?.todos ?? [];
    if (getTodoPosition(originalList, activeId, isTargetSprint) === position) return null;
  }
  return { todo, sprintId: parseContainerId(target), status, position };
}
