import { MS_PER_DAY } from '@/features/board/config/layout';
import { t } from '@/shared/i18n';
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


/** "5 days left", "1 day left", "Ends today", "Ended 1 day ago"; `null` (no text) without a date. */
export function formatDaysRemaining(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return t('board:dates.endsToday');
  if (days > 0) return t('board:dates.daysLeft', { count: days });
  return t('board:dates.endedAgo', { count: -days });
}

/** True when the end date is today or has passed (the days-left text can then use the warning tone). */
export function isSprintOverdue(days: number | null): boolean {
  return days !== null && days < 0;
}
