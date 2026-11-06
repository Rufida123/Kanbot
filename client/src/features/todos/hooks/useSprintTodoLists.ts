import { useQueries } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { listTodos } from '@/features/todos/api/todos';
import { todoKeys } from '@/features/todos/api/keys';
import { BACKLOG_STALE_TIME_MS } from '@/features/todos/config/cache';
import { buildSprintListFilters, toTodoListQuery } from '@/features/todos/utils/buildTodoFilters';
import type { ApiError } from '@/shared/api/client';
import type { Todo } from '@/shared/types/api';

/**
 * The todos of several sprints, one query each, fetched in parallel (no waterfall). The keys
 * come from the same factory as the backlog, so `['todos', projectId]` still covers all of them.
 * Results are in the order of `sprintIds`.
 */
export function useSprintTodoLists(
  projectId: string,
  sprintIds: readonly string[],
): UseQueryResult<Todo[], ApiError>[] {
  return useQueries({
    queries: sprintIds.map((sprintId) => {
      const filters = buildSprintListFilters(sprintId);
      return {
        queryKey: todoKeys.list(projectId, filters),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          listTodos(projectId, toTodoListQuery(filters), signal),
        staleTime: BACKLOG_STALE_TIME_MS,
      };
    }),
  }) as UseQueryResult<Todo[], ApiError>[];
}
