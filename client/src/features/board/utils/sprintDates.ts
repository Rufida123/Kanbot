import { MS_PER_DAY } from '@/features/board/config/layout';
import { getTodayDateOnly, parseDateOnly } from '@/shared/utils/formatDate';

/**
 * Calendar days from `today` to `endDate`: positive = still to go, 0 = ends today, negative =
 * already ended. `null` for a missing or invalid date. `Math.round`: across a daylight saving
 * change one "day" is 23 or 25 hours, so a plain division could be off by one.
 */
export function getDaysRemaining(endDate: string | null, today: string = getTodayDateOnly()): number | null {
  if (endDate === null) return null;
  const end = parseDateOnly(endDate);
  const start = parseDateOnly(today);
  if (end === null || start === null) return null;
  const days = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
  return Number.isFinite(days) ? days : null;
}

function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** "5 days left", "1 day left", "Ends today", "Ended 1 day ago"; `null` (no text) without a date. */
export function formatDaysRemaining(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return 'Ends today';
  if (days > 0) return `${formatDays(days)} left`;
  return `Ended ${formatDays(-days)} ago`;
}

/** True when the end date is today or has passed (the days-left text can then use the warning tone). */
export function isSprintOverdue(days: number | null): boolean {
  return days !== null && days < 0;
}
