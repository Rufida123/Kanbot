import { t } from '@/shared/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startSprint } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { boardKeys } from '@/features/board/api/keys';
import { projectKeys } from '@/features/projects';
import { todoKeys } from '@/features/todos';
import { showToast } from '@/shared/stores/toastStore';

/**
 * Starts a planned sprint. The project cards show the active sprint, so they refresh too.
 * It lives in `backlog` (the composition layer) because it also refreshes todo lists, and
 * `sprints` must not import `todos`. The dialog shows errors itself (a 409 message).
 */
export function useStartSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startSprint,
    onSuccess: (sprint) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: todoKeys.all(projectId) });
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(sprint.id) });
      showToast(t('sprints:toast.started', { name: sprint.name }));
    },
  });
}
