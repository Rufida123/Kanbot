import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { todoKeys } from '@/features/todos/api/keys';
import type { TodoListFilters } from '@/features/todos/api/keys';
import { BACKLOG_SPRINT_ID, hasTodoFilters } from '@/features/todos/utils/buildTodoFilters';
import { projectKeys } from '@/features/projects';
import type { Todo } from '@/shared/types/api';

/** Cached todo lists of a project: `[queryKey, data]` pairs, as `getQueriesData` returns them. */
export type TodoListSnapshot = [QueryKey, Todo[] | undefined][];

function isListFilters(value: unknown): value is TodoListFilters {
  return typeof value === 'object' && value !== null && 'sprintId' in value && 'q' in value;
}

/** Create and delete change the project counters and the cards of the project list. */
export function invalidateTodoCounters(queryClient: QueryClient, projectId: string): void {
  void queryClient.invalidateQueries({ queryKey: todoKeys.all(projectId) });
  void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: projectKeys.all });
}

/**
 * Adds a created todo to the cached, unfiltered backlog right away. Lists with filters are
 * left alone (the new todo may not match them); the invalidation refreshes them.
 */
export function appendTodoToBacklogCache(queryClient: QueryClient, todo: Todo): void {
  if (todo.sprintId !== null) return;
  queryClient.setQueriesData<Todo[]>(
    {
      queryKey: todoKeys.all(todo.projectId),
      predicate: ({ queryKey }) => {
        const filters = queryKey[2];
        return (
          isListFilters(filters) &&
          filters.sprintId === BACKLOG_SPRINT_ID &&
          !hasTodoFilters(filters)
        );
      },
    },
    (current) => {
      if (current === undefined || current.some((item) => item.id === todo.id)) return current;
      return [...current, todo];
    },
  );
}

/** Removes a todo from every cached list of its project and returns the lists as they were. */
export function removeTodoFromListCaches(
  queryClient: QueryClient,
  projectId: string,
  todoId: string,
): TodoListSnapshot {
  const snapshot = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all(projectId) });
  queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.all(projectId) }, (current) =>
    current?.filter((todo) => todo.id !== todoId),
  );
  return snapshot;
}

export function restoreTodoListCaches(queryClient: QueryClient, snapshot: TodoListSnapshot): void {
  for (const [queryKey, data] of snapshot) queryClient.setQueryData(queryKey, data);
}

/**
 * Puts a saved todo into the cached lists at once, so the row is up to date when the dialog
 * closes. A todo that left the backlog is dropped from backlog lists. Filtered lists that
 * the edit may have changed membership of are refreshed by the invalidation that follows.
 */
export function replaceTodoInListCaches(queryClient: QueryClient, todo: Todo): void {
  queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.all(todo.projectId) }, (current) => {
    if (current === undefined) return current;
    return current.flatMap((item) => {
      if (item.id !== todo.id) return [item];
      return todo.sprintId === item.sprintId ? [todo] : [];
    });
  });
}
