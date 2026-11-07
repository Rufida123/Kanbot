import { sumStoryPoints } from '@/features/todos';
import type { Todo } from '@/shared/types/api';

/**
 * The todos the user has checked. Only ids are stored; filtering the current list means an id of a
 * todo that has left the backlog simply drops out.
 */
export function getCheckedTodos(todos: readonly Todo[], checkedIds: ReadonlySet<string>): Todo[] {
  return todos.filter((todo) => checkedIds.has(todo.id));
}

/** Running total of the checked todos (a todo without an estimate counts as 0). Derived, never stored. */
export function sumCheckedPoints(todos: readonly Todo[], checkedIds: ReadonlySet<string>): number {
  return sumStoryPoints(getCheckedTodos(todos, checkedIds));
}
