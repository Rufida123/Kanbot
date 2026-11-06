import { skipToken, useQuery } from '@tanstack/react-query';
import { listSprints } from '@/features/sprints/api/sprints';
import { sprintKeys } from '@/features/sprints/api/keys';
import { SPRINT_LIST_STALE_TIME_MS } from '@/features/sprints/config/cache';
import type { ApiError } from '@/shared/api/client';
import type { Sprint } from '@/shared/types/api';

/** Sprints of a project (active first, then planned, then completed: the server's order). */
export function useSprints(projectId: string | undefined) {
  return useQuery<Sprint[], ApiError>({
    queryKey: sprintKeys.all(projectId ?? ''),
    queryFn: projectId === undefined ? skipToken : ({ signal }) => listSprints(projectId, signal),
    staleTime: SPRINT_LIST_STALE_TIME_MS,
  });
}
