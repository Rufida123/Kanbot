import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listTodos } from '@/features/todos/api/todos';
import { todoKeys } from '@/features/todos/api/keys';
import type { TodoListFilters } from '@/features/todos/api/keys';
import { BACKLOG_STALE_TIME_MS } from '@/features/todos/config/cache';
import { toTodoListQuery } from '@/features/todos/utils/buildTodoFilters';
import type { ApiError } from '@/shared/api/client';
import type { Todo } from '@/shared/types/api';

/**
 * The todos of one list (the backlog for `filters.sprintId === 'backlog'`), in the server's order.
 * While a new filter combination loads, the previous result of the same project stays visible
 * (`isPlaceholderData`), so typing never flashes a skeleton.
 */
export function useBacklog(projectId: string, filters: TodoListFilters) {
  return useQuery<Todo[], ApiError>({
    queryKey: todoKeys.list(projectId, filters),
    queryFn: ({ signal }) => listTodos(projectId, toTodoListQuery(filters), signal),
    staleTime: BACKLOG_STALE_TIME_MS,
    // Only reuse data of the same project: another project's todos must never show up.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === projectId ? keepPreviousData(previousData) : undefined,
  });
}
