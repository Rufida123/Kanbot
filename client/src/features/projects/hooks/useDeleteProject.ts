import { t } from '@/shared/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '@/features/projects/api/projects';
import { projectMutationKeys, projectKeys } from '@/features/projects/api/keys';
import { showToast } from '@/shared/stores/toastStore';

/**
 * Deletes a project and refreshes the list. The deleted project's own caches are removed by
 * `useRemoveDeletedProjectCaches` once nothing on screen observes them any more; removing them
 * here would make a still-mounted observer re-create the query and request a 404.
 * The caller navigates away (if needed) after this resolves.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: projectMutationKeys.delete,
    mutationFn: deleteProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      showToast(t('projects:toast.deleted'));
    },
  });
}
