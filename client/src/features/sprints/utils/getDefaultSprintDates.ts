import { DEFAULT_SPRINT_LENGTH_DAYS } from '@/features/sprints/config/limits';
import { addDaysToDateOnly, getTodayDateOnly, isDateOnly } from '@/shared/utils/formatDate';
import type { Sprint } from '@/shared/types/api';

export type SprintDates = { startDate: string; endDate: string };

/** Start today, end two weeks later (local time). */
export function getDefaultSprintDates(): SprintDates {
  const startDate = getTodayDateOnly();
  return { startDate, endDate: addDaysToDateOnly(startDate, DEFAULT_SPRINT_LENGTH_DAYS) };
}

/** End date that follows a start date when the user has not chosen one. */
export function getDefaultEndDate(startDate: string): string {
  return addDaysToDateOnly(startDate, DEFAULT_SPRINT_LENGTH_DAYS);
}

/**
 * Dates the start dialog opens with: the dates planned on the sprint when both are set and
 * consistent (the server keeps them too), otherwise today and +14 days.
 */
export function getStartDialogDates(sprint: Pick<Sprint, 'startDate' | 'endDate'>): SprintDates {
  const { startDate, endDate } = sprint;
  const arePlannedDatesUsable =
    startDate !== null &&
    endDate !== null &&
    isDateOnly(startDate) &&
    isDateOnly(endDate) &&
    endDate >= startDate;
  return arePlannedDatesUsable ? { startDate, endDate } : getDefaultSprintDates();
}
