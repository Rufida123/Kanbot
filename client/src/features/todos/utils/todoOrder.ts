import { TODO_STATUSES } from '@/shared/types/api';
import type { Todo, TodoStatus } from '@/shared/types/api';

/**
 * A list is the backlog (one list, any status) or one status column of one sprint. The API
 * returns a sprint's todos grouped by status, and `position` counts inside the status column
 * of the todo. `isGroupedByStatus` is true for sprint lists.
 */
type Positioned = Pick<Todo, 'id' | 'status'>;

function getStatusRank(status: TodoStatus): number {
  return TODO_STATUSES.indexOf(status);
}

/** Stable sort by board column: todos of one status keep their relative order. */
export function sortByStatus<TTodo extends Positioned>(todos: readonly TTodo[]): TTodo[] {
  return todos
    .map((todo, index) => ({ todo, index }))
    .sort((a, b) => getStatusRank(a.todo.status) - getStatusRank(b.todo.status) || a.index - b.index)
    .map(({ todo }) => todo);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * `todo` inserted at `position` of its list, as the server does: the index is counted after
 * removing the todo, and inside its status column for sprint lists. Returns a new array.
 */
export function insertTodoAtPosition<TTodo extends Positioned>(
  list: readonly TTodo[],
  todo: TTodo,
  position: number,
  isGroupedByStatus: boolean,
): TTodo[] {
  const rest = list.filter((item) => item.id !== todo.id);
  const insertAt = (index: number) => [...rest.slice(0, index), todo, ...rest.slice(index)];

  if (!isGroupedByStatus) return insertAt(clamp(position, 0, rest.length));

  const column = rest.filter((item) => item.status === todo.status);
  const target = column[clamp(position, 0, column.length)];
  if (target !== undefined) return insertAt(rest.indexOf(target));
  const last = column[column.length - 1];
  if (last !== undefined) return insertAt(rest.indexOf(last) + 1);
  const nextColumnIndex = rest.findIndex(
    (item) => getStatusRank(item.status) > getStatusRank(todo.status),
  );
  return insertAt(nextColumnIndex === -1 ? rest.length : nextColumnIndex);
}

/** The `position` of a todo that sits in `list`: its index, or its index inside its status column. */
export function getTodoPosition(
  list: readonly Positioned[],
  todoId: string,
  isGroupedByStatus: boolean,
): number {
  if (!isGroupedByStatus) return list.findIndex((item) => item.id === todoId);
  const sorted = sortByStatus(list);
  const todo = sorted.find((item) => item.id === todoId);
  if (todo === undefined) return -1;
  return sorted.filter((item) => item.status === todo.status).findIndex((item) => item.id === todoId);
}

/** Number of todos in the status column of `status` (sprint lists) or in the whole list (backlog). */
export function getListLength(
  list: readonly Positioned[],
  status: TodoStatus,
  isGroupedByStatus: boolean,
): number {
  return isGroupedByStatus ? list.filter((item) => item.status === status).length : list.length;
}
