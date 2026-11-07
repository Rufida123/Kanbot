import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkCreateTodos } from '@/features/todos/api/todos';
import { invalidateTodoCounters } from '@/features/todos/utils/todoCache';
import { showToast } from '@/shared/stores/toastStore';
import { formatCount } from '@/shared/utils/formatCount';

/**
 * Saves several todos into the backlog at once (the AI drafts the user confirmed). There is no
 * optimistic update: the user pressed the button on purpose, so the lists are simply refreshed
 * (todos, project counters, project list). The dialog that calls it shows errors itself.
 */
export function useBulkCreateTodos(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateTodos,
    onSuccess: (todos) => {
      invalidateTodoCounters(queryClient, projectId);
      showToast(`Added ${formatCount(todos.length, 'todo')}`);
    },
  });
}
