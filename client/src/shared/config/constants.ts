import { STORY_POINTS, TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from '@/shared/types/api';
import type {
  SprintStatus,
  StoryPoints,
  TodoPriority,
  TodoStatus,
  TodoType,
} from '@/shared/types/api';
import { t } from '@/shared/i18n';

/**
 * Display labels of the todo fields. The maps use getters, so `STATUS_LABELS[status]` always
 * returns the text in the active language (it is read at render time, not at import time).
 */
function labelMap<TKey extends string>(keys: readonly TKey[], namespaceKey: string): Record<TKey, string> {
  const map = {} as Record<TKey, string>;
  for (const key of keys) {
    Object.defineProperty(map, key, { enumerable: true, get: () => t(`common:${namespaceKey}.${key}`) });
  }
  return map;
}

export const STATUS_LABELS: Record<TodoStatus, string> = labelMap(TODO_STATUSES, 'status');
export const PRIORITY_LABELS: Record<TodoPriority, string> = labelMap(TODO_PRIORITIES, 'priority');
export const TYPE_LABELS: Record<TodoType, string> = labelMap(TODO_TYPES, 'type');
export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = labelMap(
  ['planned', 'active', 'completed'] as const,
  'sprintStatus',
);

export type SelectOption<TValue extends string = string> = { value: TValue; label: string };

function toOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): readonly SelectOption<TValue>[] {
  // `label` is a getter: options stay translated after a language change.
  return values.map((value) => ({
    value,
    get label() {
      return labels[value];
    },
  }));
}

export const STATUS_OPTIONS = toOptions(TODO_STATUSES, STATUS_LABELS);
export const PRIORITY_OPTIONS = toOptions(TODO_PRIORITIES, PRIORITY_LABELS);
export const TYPE_OPTIONS = toOptions(TODO_TYPES, TYPE_LABELS);

/** Allowed story points. `null` (not estimated) is handled by the field itself. */
export const STORY_POINT_VALUES: readonly StoryPoints[] = STORY_POINTS;
