import { useQuery } from '@tanstack/react-query';
import { listProjects } from '@/features/projects/api/projects';
import { projectKeys } from '@/features/projects/api/keys';
import { PROJECT_LIST_STALE_TIME_MS } from '@/features/projects/config/cache';

/** The one query for the project list: shared by the page, the switcher and the dialogs. */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: ({ signal }) => listProjects(signal),
    staleTime: PROJECT_LIST_STALE_TIME_MS,
  });
}
