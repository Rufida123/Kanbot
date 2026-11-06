import type { ProjectWithStats } from '@/shared/types/api';

const NO_ACTIVE_SPRINT_LABEL = 'No active sprint';

export function hasActiveSprint(project: ProjectWithStats): boolean {
  return project.stats.activeSprint !== null;
}

/** "Sprint 3" or "No active sprint". */
export function getActiveSprintLabel(project: ProjectWithStats): string {
  return project.stats.activeSprint?.name ?? NO_ACTIVE_SPRINT_LABEL;
}

export function getBacklogLabel(project: ProjectWithStats): string {
  return `${project.stats.backlogCount} in backlog`;
}
