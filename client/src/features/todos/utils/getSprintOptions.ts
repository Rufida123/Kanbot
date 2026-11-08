import { backlogLabel } from '@/features/todos/config/copy';
import { t } from '@/shared/i18n';
import { SPRINT_STATUS_LABELS } from '@/shared/config/constants';
import type { SelectOption } from '@/shared/config/constants';
import type { Sprint, Todo } from '@/shared/types/api';

function getSprintLabel(sprint: Pick<Sprint, 'name' | 'status'>): string {
  return t('todos:form.sprintOption', { name: sprint.name, status: SPRINT_STATUS_LABELS[sprint.status].toLowerCase() });
}

/**
 * Options of the sprint select: Backlog, then planned and active sprints. The todo's current
 * sprint is always included (even a completed one, or one that is not loaded yet), so the
 * select never shows a value that is not in its list.
 */
export function getSprintOptions(
  sprints: readonly Sprint[] | undefined,
  currentSprintId: Todo['sprintId'],
): SelectOption[] {
  const options: SelectOption[] = [{ value: '', label: backlogLabel() }];
  for (const sprint of sprints ?? []) {
    if (sprint.status === 'completed' && sprint.id !== currentSprintId) continue;
    options.push({ value: sprint.id, label: getSprintLabel(sprint) });
  }
  const isCurrentListed = options.some((option) => option.value === (currentSprintId ?? ''));
  if (currentSprintId !== null && !isCurrentListed) {
    options.push({ value: currentSprintId, label: t('todos:form.currentSprint') });
  }
  return options;
}
