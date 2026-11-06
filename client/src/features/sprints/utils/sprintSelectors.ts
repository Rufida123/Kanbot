import type { Sprint } from '@/shared/types/api';

/** The one active sprint of the project, if any. */
export function getActiveSprint<TSprint extends Pick<Sprint, 'status'>>(
  sprints: readonly TSprint[] | undefined,
): TSprint | undefined {
  return sprints?.find((sprint) => sprint.status === 'active');
}

/** Planned sprints, in the server's order (oldest first). */
export function getPlannedSprints<TSprint extends Pick<Sprint, 'status'>>(
  sprints: readonly TSprint[] | undefined,
): TSprint[] {
  return sprints?.filter((sprint) => sprint.status === 'planned') ?? [];
}

/** A sprint can start when it is planned and no sprint is active (SPR-3). */
export function isSprintStartable(
  sprint: Pick<Sprint, 'status'>,
  sprints: readonly Pick<Sprint, 'status'>[],
): boolean {
  return sprint.status === 'planned' && getActiveSprint(sprints) === undefined;
}

/** Edit and delete exist for planned sprints only. */
export function isSprintEditable(sprint: Pick<Sprint, 'status'>): boolean {
  return sprint.status === 'planned';
}
