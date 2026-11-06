import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodo } from '@/features/todos/api/todos';
import { todoKeys } from '@/features/todos/api/keys';
import { TODO_DETAIL_STALE_TIME_MS } from '@/features/todos/config/cache';
import type { ApiError } from '@/shared/api/client';
import type { Todo } from '@/shared/types/api';

/**
 * One todo by id (`undefined` keeps the query idle). The row from a cached list is shown as
 * placeholder while the detail request runs: `placeholderData`, not `initialData`, because
 * the list entry may be older than the server's version. Check `isPlaceholderData`.
 */
export function useTodo(todoId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery<Todo, ApiError>({
    queryKey: todoKeys.detail(todoId ?? ''),
    queryFn: todoId === undefined ? skipToken : ({ signal }) => getTodo(todoId, signal),
    staleTime: TODO_DETAIL_STALE_TIME_MS,
    placeholderData: () => {
      for (const [, todos] of queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] })) {
        const found = todos?.find((todo) => todo.id === todoId);
        if (found !== undefined) return found;
      }
      return undefined;
    },
  });
}
