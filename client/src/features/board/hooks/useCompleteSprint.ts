import { t } from '@/shared/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardKeys } from '@/features/board/api/keys';
import { projectKeys } from '@/features/projects';
import { completeSprint } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { todoKeys } from '@/features/todos';
import { showToast } from '@/shared/stores/toastStore';
import type { ProjectWithStats, Sprint, SprintBoardResponse } from '@/shared/types/api';

/**
 * Completes the active sprint. On success the cached board and project are updated at once
 * (so the board shows its empty state, never the old cards, when the user comes back), then
 * everything that depends on the sprint is refreshed. On a failure the dialog shows the
 * message; the data is refreshed too, because a 409 or 400 means the cache was out of date.
 */
export function useCompleteSprint(projectId: string) {
  const queryClient = useQueryClient();

  const refreshProjectData = (sprintId: string) => {
    void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
    void queryClient.invalidateQueries({ queryKey: sprintKeys.detail(sprintId) });
    void queryClient.invalidateQueries({ queryKey: boardKeys.detail(sprintId) });
    void queryClient.invalidateQueries({ queryKey: todoKeys.all(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.all });
  };

  return useMutation<Sprint, unknown, { sprintId: string; moveUnfinishedTo: string }>({
    mutationFn: ({ sprintId, moveUnfinishedTo }) =>
      completeSprint({ sprintId, request: { moveUnfinishedTo } }),
    onSuccess: (sprint) => {
      queryClient.setQueryData<SprintBoardResponse>(boardKeys.detail(sprint.id), (board) =>
        board === undefined ? board : { ...board, sprint },
      );
      queryClient.setQueryData<ProjectWithStats>(projectKeys.detail(projectId), (project) =>
        project === undefined ? project : { ...project, stats: { ...project.stats, activeSprint: null } },
      );
      queryClient.setQueryData(sprintKeys.detail(sprint.id), sprint);
      refreshProjectData(sprint.id);
      showToast(t('board:complete.completedToast', { name: sprint.name }));
    },
    onError: (_error, { sprintId }) => refreshProjectData(sprintId),
  });
}
