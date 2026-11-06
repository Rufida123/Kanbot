import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { projectKeys, projectMutationKeys } from '@/features/projects/api/keys';
import { PROJECT_ID_PARAM } from '@/app/navigation';

/**
 * Removes the cached data of deleted projects (AI_RULES §7: `removeQueries` for deleted
 * entities; never `invalidateQueries`, which would refetch a 404).
 *
 * Call it from the component that is an ancestor of everything observing project queries
 * (the app shell). React runs a parent's effects after its children's in the same commit,
 * so by the time this runs the observers of the old project id have already switched away
 * after the navigation. Removing earlier lets a still-mounted observer recreate the query.
 */
export function useRemoveDeletedProjectCaches(): void {
  const queryClient = useQueryClient();
  const currentProjectId = useParams()[PROJECT_ID_PARAM];
  const deletedProjectIds = useMutationState({
    filters: { mutationKey: projectMutationKeys.delete, status: 'success' },
    select: (mutation) => mutation.state.variables,
  });

  useEffect(() => {
    for (const projectId of deletedProjectIds) {
      if (typeof projectId !== 'string' || projectId === currentProjectId) continue;
      for (const queryKey of projectKeys.relatedPrefixes(projectId)) {
        queryClient.removeQueries({ queryKey });
      }
    }
  }, [deletedProjectIds, currentProjectId, queryClient]);
}
