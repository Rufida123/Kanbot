import { t } from '@/shared/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSprint } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { boardKeys } from '@/features/board/api/keys';
import { invalidateTodoListsExceptSprint } from '@/features/todos';
import { showToast } from '@/shared/stores/toastStore';
import type { Sprint } from '@/shared/types/api';

export type DeleteSprintVariables = { sprintId: string; name: string };

/**
 * Deletes a planned sprint; the server returns its todos to the end of the backlog.
 * The sprint leaves the cached list first, so its section unmounts; then everything else is
 * refreshed except the deleted sprint's own todo list (it would only refetch an error).
 * A sprint that is already gone (404) counts as deleted (see `deleteSprint`).
 */
export function useDeleteSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId }: DeleteSprintVariables) => deleteSprint(sprintId),
    onSuccess: (_data, { sprintId }) => {
      queryClient.setQueryData<Sprint[]>(sprintKeys.all(projectId), (current) =>
        current?.filter((sprint) => sprint.id !== sprintId),
      );
      invalidateTodoListsExceptSprint(queryClient, projectId, sprintId);
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
      queryClient.removeQueries({ queryKey: boardKeys.detail(sprintId) });
      showToast(t('sprints:toast.deleted'));
    },
  });
}
