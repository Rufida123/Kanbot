import type { Todo } from '@/shared/types/api';

/** Total story points; a todo without an estimate counts as 0. */
export function sumStoryPoints(todos: readonly Pick<Todo, 'storyPoints'>[]): number {
  let total = 0;
  for (const todo of todos) total += todo.storyPoints ?? 0;
  return total;
}
