import type { Todo } from '@/shared/types/api';

export type PlanTodosMatch = {
  /** The suggested todos that are still in the backlog, in the suggested order. */
  todos: Todo[];
  /** Suggested ids that are not in the backlog any more (stale). */
  missingCount: number;
};

/**
 * Matches the ids of an AI plan against the cached backlog. The server only suggests real backlog
 * ids, but the cache can be newer than the suggestion: unknown ids are skipped and counted,
 * repeated ids count once.
 */
export function matchPlanTodos(todoIds: readonly string[], backlog: readonly Todo[]): PlanTodosMatch {
  const backlogById = new Map(backlog.map((todo) => [todo.id, todo]));
  const seenIds = new Set<string>();
  const todos: Todo[] = [];
  for (const todoId of todoIds) {
    if (seenIds.has(todoId)) continue;
    seenIds.add(todoId);
    const todo = backlogById.get(todoId);
    if (todo !== undefined) todos.push(todo);
  }
  return { todos, missingCount: seenIds.size - todos.length };
}

/** The backlog todos the AI did not suggest, in backlog order: the user may still add them to the sprint. */
export function getUnsuggestedTodos(suggested: readonly Todo[], backlog: readonly Todo[]): Todo[] {
  const suggestedIds = new Set(suggested.map((todo) => todo.id));
  return backlog.filter((todo) => !suggestedIds.has(todo.id));
}
