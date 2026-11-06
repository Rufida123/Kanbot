import { STORY_POINTS, TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from '@/shared/types/api';
import type {
  SprintStatus,
  StoryPoints,
  TodoPriority,
  TodoStatus,
  TodoType,
} from '@/shared/types/api';

/** Display labels and option lists of the todo fields. Order follows the API contract. */
export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TYPE_LABELS: Record<TodoType, string> = {
  task: 'Task',
  story: 'Story',
  bug: 'Bug',
};

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  planned: 'Planned',
  active: 'Active',
  completed: 'Completed',
};

export type SelectOption<TValue extends string = string> = { value: TValue; label: string };

function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): readonly SelectOption<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

export const STATUS_OPTIONS = toOptions(TODO_STATUSES, STATUS_LABELS);
export const PRIORITY_OPTIONS = toOptions(TODO_PRIORITIES, PRIORITY_LABELS);
export const TYPE_OPTIONS = toOptions(TODO_TYPES, TYPE_LABELS);

/** Allowed story points. `null` (not estimated) is handled by the field itself. */
export const STORY_POINT_VALUES: readonly StoryPoints[] = STORY_POINTS;

/** Locale of every displayed date. The app is English only (no i18n). */
export const DATE_LOCALE = 'en-US';
