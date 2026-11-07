import { toPercent } from '@/features/board/utils/progress';
import type { Sprint, SprintStats } from '@/shared/types/api';

export function isSprintCompleted(sprint: Pick<Sprint, 'status'>): boolean {
  return sprint.status === 'completed';
}

/** A completed sprint shows its saved final numbers; any other sprint shows the live ones. */
export function getSprintStats(sprint: Pick<Sprint, 'status' | 'stats' | 'completedStats'>): SprintStats {
  return isSprintCompleted(sprint) ? (sprint.completedStats ?? sprint.stats) : sprint.stats;
}

/** Todos that left a completed sprint unfinished; `null` for a sprint that is not completed. */
export function getCarriedOver(sprint: Pick<Sprint, 'status' | 'completedStats'>): number | null {
  if (!isSprintCompleted(sprint)) return null;
  return sprint.completedStats?.carriedOver ?? null;
}

/** Done todos as a percentage of all todos of the sprint; 0 for an empty sprint. */
export function getCompletionPercent(stats: Pick<SprintStats, 'doneTodos' | 'totalTodos'>): number {
  return toPercent(stats.doneTodos, stats.totalTodos);
}
