import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/features/projects/api/projects';
import { projectKeys } from '@/features/projects/api/keys';
import { showToast } from '@/shared/stores/toastStore';

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      // The server re-sorts the list by `updatedAt`, so the list is refetched, not patched.
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showToast('Project updated');
    },
  });
}
