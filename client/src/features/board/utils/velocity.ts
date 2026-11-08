import type { Sprint } from '@/shared/types/api';

export type VelocityPoint = { id: string; name: string; committed: number; completed: number };

/**
 * Velocity (enhancement 12): committed vs completed points of the completed sprints, oldest first,
 * from the final numbers saved when each sprint was completed (`completedStats`).
 */
export function buildVelocity(sprints: readonly Sprint[]): { points: VelocityPoint[]; average: number } {
  const points = sprints
    .filter((sprint) => sprint.status === 'completed' && sprint.completedStats !== null)
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
    .map((sprint) => ({
      id: sprint.id,
      name: sprint.name,
      committed: sprint.completedStats?.totalPoints ?? 0,
      completed: sprint.completedStats?.donePoints ?? 0,
    }));
  const average = points.length === 0 ? 0 : Math.round((points.reduce((sum, point) => sum + point.completed, 0) / points.length) * 10) / 10;
  return { points, average };
}
