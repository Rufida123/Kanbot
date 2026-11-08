import { DEFAULT_SPRINT_LENGTH_DAYS } from '@/features/sprints/config/limits';
import { getPreference } from '@/shared/lib/preferences';
import type { SprintTemplate } from '@/shared/lib/preferences';

export const TEMPLATE_LIMITS = { lengthMin: 1, lengthMax: 60, capacityMin: 1, capacityMax: 500 } as const;
/** Capacity the AI planner starts with when no template is saved. */
export const DEFAULT_CAPACITY = 20;

function isInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/** The saved sprint template (enhancement 14), or `null` when the user never saved one. */
export function getSavedSprintTemplate(): SprintTemplate | null {
  const saved = getPreference('sprintTemplate');
  if (saved === undefined) return null;
  return isInRange(saved.lengthDays, TEMPLATE_LIMITS.lengthMin, TEMPLATE_LIMITS.lengthMax) &&
    isInRange(saved.capacity, TEMPLATE_LIMITS.capacityMin, TEMPLATE_LIMITS.capacityMax)
    ? saved
    : null;
}

/** Template with the built-in values filled in: used by the start dialog and the AI planner. */
export function getSprintTemplate(): SprintTemplate {
  return getSavedSprintTemplate() ?? { lengthDays: DEFAULT_SPRINT_LENGTH_DAYS, capacity: DEFAULT_CAPACITY };
}
