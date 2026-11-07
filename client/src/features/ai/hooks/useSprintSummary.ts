import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestSprintSummary } from '@/features/ai/api/ai';
import { aiMutationKeys } from '@/features/ai/api/keys';
import { useAbortSignal } from '@/features/ai/hooks/useAbortSignal';
import { boardKeys } from '@/features/board/api/keys';
import { sprintKeys } from '@/features/sprints';
import type { SprintBoardResponse } from '@/shared/types/api';

/**
 * AI-4: generates (or regenerates) the summary of a sprint. The server saves it on the sprint, so
 * the returned sprint replaces the cached one the same way `useCompleteSprint` does: the sprint
 * detail and the `sprint` of the cached board. The board's `columns` are left alone and the board
 * is not invalidated: a drag may be saving at this moment.
 */
export function useSprintSummary(projectId: string) {
  const queryClient = useQueryClient();
  const { start } = useAbortSignal();
  return useMutation({
    mutationKey: aiMutationKeys.sprintSummary,
    mutationFn: (sprintId: string) => requestSprintSummary({ sprintId, signal: start() }),
    onSuccess: ({ sprint }) => {
      queryClient.setQueryData(sprintKeys.detail(sprint.id), sprint);
      queryClient.setQueryData<SprintBoardResponse>(boardKeys.detail(sprint.id), (board) =>
        board === undefined ? board : { ...board, sprint },
      );
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
    },
  });
}
