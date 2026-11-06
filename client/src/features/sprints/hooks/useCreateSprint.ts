import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSprint } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { projectKeys } from '@/features/projects';
import { showToast } from '@/shared/stores/toastStore';

/**
 * Creates a planned sprint. The server also touches the project's `updatedAt` (it orders the
 * project list), so the list is refreshed too; it is only refetched while it is on screen.
 * The form shows errors itself, so there is no error toast here.
 */
export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSprint,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showToast('Sprint created');
    },
  });
}
