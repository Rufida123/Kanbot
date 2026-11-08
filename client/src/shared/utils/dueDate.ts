import { addDaysToDateOnly, getTodayDateOnly } from '@/shared/utils/formatDate';

export type DueState = 'overdue' | 'today' | 'soon' | 'later';

/** Days within which a todo counts as "soon". */
export const SOON_DAYS = 3;

/**
 * Overdue (before today), today, soon (next {@link SOON_DAYS} days) or later.
 * A done todo is never overdue: pass `isDone` and the badge stays neutral.
 */
export function getDueState(dueDate: string | null, isDone = false, today: string = getTodayDateOnly()): DueState | null {
  if (dueDate === null) return null;
  if (isDone) return 'later';
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return dueDate <= addDaysToDateOnly(today, SOON_DAYS) ? 'soon' : 'later';
}

/** Monday-first week containing `today`: seven `YYYY-MM-DD` strings. */
export function getWeekDays(today: string = getTodayDateOnly()): string[] {
  const [year, month, day] = today.split('-').map(Number) as [number, number, number];
  const weekday = (new Date(year, month - 1, day).getDay() + 6) % 7;
  const monday = addDaysToDateOnly(today, -weekday);
  return Array.from({ length: 7 }, (_, index) => addDaysToDateOnly(monday, index));
}
