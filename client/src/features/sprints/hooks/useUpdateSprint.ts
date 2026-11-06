import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSprint } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { projectKeys } from '@/features/projects';
import { showToast } from '@/shared/stores/toastStore';

/** Saves the changed fields of a planned sprint. The form shows errors itself. */
export function useUpdateSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSprint,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showToast('Sprint updated');
    },
  });
}
