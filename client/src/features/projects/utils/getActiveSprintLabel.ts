import { t } from '@/shared/i18n';
import type { ProjectWithStats } from '@/shared/types/api';

export function hasActiveSprint(project: ProjectWithStats): boolean {
  return project.stats.activeSprint !== null;
}

/** The active sprint's name, or "No active sprint". */
export function getActiveSprintLabel(project: ProjectWithStats): string {
  return project.stats.activeSprint?.name ?? t('projects:card.noActiveSprint');
}

export function getBacklogLabel(project: ProjectWithStats): string {
  return t('projects:card.inBacklog', { count: project.stats.backlogCount });
}
