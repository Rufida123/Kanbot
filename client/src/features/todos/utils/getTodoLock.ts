import type { Sprint, Todo } from '@/shared/types/api';

/**
 * - `editable`: normal todo.
 * - `locked`: the todo is in a completed sprint, so the dialog is read-only.
 * - `checking`: the todo is in a sprint and the sprint list is still loading, so the form
 *   waits (a todo of a completed sprint must never be editable for a moment).
 * When the sprint list failed to load the todo stays `editable`: the server still refuses
 * moves out of a completed sprint (409), and title edits were allowed before.
 */
export type TodoLock = 'editable' | 'locked' | 'checking';

export function getTodoLock(params: {
  todo: Pick<Todo, 'sprintId'>;
  sprints: readonly Pick<Sprint, 'id' | 'status'>[] | undefined;
  isSprintsError: boolean;
}): TodoLock {
  const { todo, sprints, isSprintsError } = params;
  if (todo.sprintId === null) return 'editable';
  if (sprints === undefined) return isSprintsError ? 'editable' : 'checking';
  const sprint = sprints.find((item) => item.id === todo.sprintId);
  return sprint?.status === 'completed' ? 'locked' : 'editable';
}
