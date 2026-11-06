import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTodo } from '@/features/todos/api/todos';
import { todoKeys, todoMutationKeys } from '@/features/todos/api/keys';
import {
  invalidateTodoCounters,
  removeTodoFromListCaches,
  restoreTodoListCaches,
} from '@/features/todos/utils/todoCache';
import type { TodoListSnapshot } from '@/features/todos/utils/todoCache';
import { ApiError } from '@/shared/api/client';
import { showToast } from '@/shared/stores/toastStore';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

export type DeleteTodoVariables = { id: string; projectId: string };

type DeleteContext = { snapshot: TodoListSnapshot };

/**
 * Optimistic delete: the row leaves every cached list at once and comes back (with a toast)
 * if the request fails. The deleted todo's own cache entry is removed by `TodoDetailsHost`
 * once the dialog is gone; invalidating it here would refetch a 404.
 * A 404 means the todo is already gone, which is what the user wanted, so it counts as success.
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, DeleteTodoVariables, DeleteContext>({
    mutationKey: todoMutationKeys.delete,
    mutationFn: async ({ id }) => {
      try {
        await deleteTodo(id);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return;
        throw error;
      }
    },
    onMutate: async ({ id, projectId }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.all(projectId) });
      return { snapshot: removeTodoFromListCaches(queryClient, projectId, id) };
    },
    onError: (error, _variables, context) => {
      if (context !== undefined) restoreTodoListCaches(queryClient, context.snapshot);
      showToast(getErrorMessage(error), 'error');
    },
    onSuccess: () => showToast('Todo deleted'),
    onSettled: (_data, _error, { projectId }) => {
      if (queryClient.isMutating({ mutationKey: todoMutationKeys.delete }) === 1) {
        invalidateTodoCounters(queryClient, projectId);
      }
    },
  });
}
