import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import { getProject } from '@/features/projects/api/projects';
import { projectKeys } from '@/features/projects/api/keys';
import { PROJECT_DETAIL_STALE_TIME_MS } from '@/features/projects/config/cache';
import type { ProjectWithStats } from '@/shared/types/api';

/**
 * One project by id (`undefined` while outside a project: the query stays idle).
 * The list entry is shown as placeholder so names appear instantly while the detail request
 * runs in parallel. `placeholderData` (not `initialData`): the list counters may be stale.
 */
export function useProject(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery<ProjectWithStats, ApiError>({
    queryKey: projectKeys.detail(projectId ?? ''),
    queryFn: projectId === undefined ? skipToken : ({ signal }) => getProject(projectId, signal),
    staleTime: PROJECT_DETAIL_STALE_TIME_MS,
    placeholderData: () =>
      queryClient
        .getQueryData<ProjectWithStats[]>(projectKeys.all)
        ?.find((project) => project.id === projectId),
  });
}
