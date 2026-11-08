import { useTranslation } from 'react-i18next';
import type { SprintStatus, TodoPriority, TodoStatus, TodoType } from '@/shared/types/api';

/**
 * Hook to get translated labels for todo enums.
 * Returns i18n-aware labels for status, priority, type, and sprint status.
 */
export function useTodoLabels() {
  const { t } = useTranslation(['todos']);

  const statusLabels: Record<TodoStatus, string> = {
    todo: t('todos:todoStatus.todo'),
    in_progress: t('todos:todoStatus.inProgress'),
    in_review: t('todos:todoStatus.inReview'),
    done: t('todos:todoStatus.done'),
  };

  const priorityLabels: Record<TodoPriority, string> = {
    low: t('todos:todoPriority.low'),
    medium: t('todos:todoPriority.medium'),
    high: t('todos:todoPriority.high'),
    urgent: t('todos:todoPriority.urgent'),
  };

  const typeLabels: Record<TodoType, string> = {
    task: t('todos:typeIcon.task'),
    story: t('todos:typeIcon.story'),
    bug: t('todos:typeIcon.bug'),
  };

  const sprintStatusLabels: Record<SprintStatus, string> = {
    planned: t('todos:sprintSection.planning'),
    active: t('todos:sprintSection.active'),
    completed: t('todos:sprintSection.completed'),
  };

  return { statusLabels, priorityLabels, typeLabels, sprintStatusLabels };
}

