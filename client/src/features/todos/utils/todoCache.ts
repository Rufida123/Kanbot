import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { todoKeys } from '@/features/todos/api/keys';
import type { TodoListFilters } from '@/features/todos/api/keys';
import { BACKLOG_SPRINT_ID, hasTodoFilters } from '@/features/todos/utils/buildTodoFilters';
import { insertTodoAtPosition } from '@/features/todos/utils/todoOrder';
import { projectKeys } from '@/features/projects';
import type { Todo, TodoStatus } from '@/shared/types/api';

/** Cached todo lists of a project: `[queryKey, data]` pairs, as `getQueriesData` returns them. */
export type TodoListSnapshot = [QueryKey, Todo[] | undefined][];

export function isListFilters(value: unknown): value is TodoListFilters {
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

/** Where a todo goes: `sprintId` null = backlog; `position` as in `MoveTodoRequest`. */
export type TodoMove = {
  /** The todo before the move. */
  todo: Todo;
  sprintId: string | null;
  /** The new status; `undefined` keeps the current one. */
  status: TodoStatus | undefined;
  position: number;
};

function getListSprintId(filters: TodoListFilters): string | null {
  return filters.sprintId === BACKLOG_SPRINT_ID ? null : filters.sprintId;
}

/**
 * Applies a move to the cached lists with new arrays (the cache is never mutated):
 * - the source list loses the todo (every filter variant of it);
 * - a move inside one list reorders the unfiltered list;
 * - the target list gets the todo, only if it is the unfiltered one (a filtered list cannot
 *   know the real position, and the todo may not match its filter: the refetch settles it).
 * `snapshot` is `getQueriesData` taken before; array order is the truth until the refetch.
 */
export function applyMoveToListCaches(
  queryClient: QueryClient,
  snapshot: TodoListSnapshot,
  move: TodoMove,
): void {
  const moved: Todo = {
    ...move.todo,
    sprintId: move.sprintId,
    status: move.status ?? move.todo.status,
  };
  const isSameList = move.sprintId === move.todo.sprintId;

  for (const [queryKey, data] of snapshot) {
    const filters = queryKey[2];
    if (data === undefined || !isListFilters(filters)) continue;
    const listSprintId = getListSprintId(filters);
    const isFiltered = hasTodoFilters(filters);

    if (listSprintId === move.todo.sprintId && !isSameList) {
      queryClient.setQueryData<Todo[]>(
        queryKey,
        data.filter((todo) => todo.id !== move.todo.id),
      );
      continue;
    }
    if (listSprintId !== move.sprintId || isFiltered) continue;
    queryClient.setQueryData<Todo[]>(
      queryKey,
      insertTodoAtPosition(data, moved, move.position, move.sprintId !== null),
    );
  }
}

/**
 * Refreshes every todo list of the project and the project counters, except the lists of one
 * sprint. Used after a sprint was deleted: its own list is still observed for a moment and
 * would only refetch an error.
 */
export function invalidateTodoListsExceptSprint(
  queryClient: QueryClient,
  projectId: string,
  sprintId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: todoKeys.all(projectId),
    predicate: ({ queryKey }) => {
      const filters = queryKey[2];
      return !(isListFilters(filters) && filters.sprintId === sprintId);
    },
  });
  void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: projectKeys.all });
}
