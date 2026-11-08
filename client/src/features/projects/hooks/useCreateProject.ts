import { t } from '@/shared/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/features/projects/api/projects';
import { projectKeys } from '@/features/projects/api/keys';
import { showToast } from '@/shared/stores/toastStore';

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      // The new project's pages open right away: seed its detail from the response.
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showToast(t('projects:toast.created'));
    },
  });
}
