import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSprint } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { SPRINT_DETAIL_STALE_TIME_MS } from '@/features/sprints/config/cache';
import type { ApiError } from '@/shared/api/client';
import type { Sprint } from '@/shared/types/api';

/**
 * One sprint by id. The entry of the cached sprint list is shown as placeholder while the
 * detail request runs (`placeholderData`, not `initialData`: the list may be older).
 */
export function useSprint(sprintId: string | undefined, projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery<Sprint, ApiError>({
    queryKey: sprintKeys.detail(sprintId ?? ''),
    queryFn: sprintId === undefined ? skipToken : ({ signal }) => getSprint(sprintId, signal),
    staleTime: SPRINT_DETAIL_STALE_TIME_MS,
    placeholderData: () =>
      projectId === undefined
        ? undefined
        : queryClient.getQueryData<Sprint[]>(sprintKeys.all(projectId))?.find((sprint) => sprint.id === sprintId),
  });
}
