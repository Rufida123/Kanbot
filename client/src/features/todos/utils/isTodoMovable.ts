import type { Sprint, Todo } from '@/shared/types/api';

/**
 * Todos of a completed sprint cannot change sprint or status (the server answers 409).
 * `undefined` sprints = the sprint list is not known yet, so a todo inside a sprint
 * is treated as not movable until it is.
 */
export function isTodoMovable(
  todo: Pick<Todo, 'sprintId'>,
  sprints: readonly Pick<Sprint, 'id' | 'status'>[] | undefined,
): boolean {
  if (todo.sprintId === null) return true;
  if (sprints === undefined) return false;
  const sprint = sprints.find((item) => item.id === todo.sprintId);
  return sprint !== undefined && sprint.status !== 'completed';
}
