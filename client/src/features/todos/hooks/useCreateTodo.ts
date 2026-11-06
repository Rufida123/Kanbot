import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '@/features/todos/api/todos';
import { todoMutationKeys } from '@/features/todos/api/keys';
import { appendTodoToBacklogCache, invalidateTodoCounters } from '@/features/todos/utils/todoCache';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { showToast } from '@/shared/stores/toastStore';

/**
 * Quick create. The mutation `scope` runs creates of one project one after another, in the
 * order they were started: otherwise "A", "B", "C" typed fast could reach the server out of order.
 * Errors are toasted here; the caller awaits `mutateAsync` to restore the typed text.
 */
export function useCreateTodo(projectId: string) {
  const queryClient = useQueryClient();
  const mutationKey = todoMutationKeys.create(projectId);
  return useMutation({
    mutationKey,
    scope: { id: `create-todo-${projectId}` },
    mutationFn: createTodo,
    onSuccess: (todo) => appendTodoToBacklogCache(queryClient, todo),
    onError: (error) => showToast(getErrorMessage(error), 'error'),
    onSettled: () => {
      // While more creates are queued, refresh once after the last one (this one still counts).
      if (queryClient.isMutating({ mutationKey }) === 1) invalidateTodoCounters(queryClient, projectId);
    },
  });
}
