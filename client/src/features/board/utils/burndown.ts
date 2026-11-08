import type { Todo } from '@/shared/types/api';
import { addDaysToDateOnly, parseDateOnly } from '@/shared/utils/formatDate';

export type BurndownPoint = {
  date: string;
  /** Points left on the ideal straight line. */
  ideal: number;
  /** Points left at the end of that day. `null` for days after today. */
  actual: number | null;
};

export type Burndown = { total: number; days: BurndownPoint[]; todayIndex: number | null };

const MS_PER_DAY = 86_400_000;

/** `YYYY-MM-DD` of an ISO timestamp in the user's time zone. */
function dayOf(timestamp: string): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Burndown of a sprint (enhancement 11): remaining points at the end of each day, from
 * `completedAt` and story points, against the ideal straight line.
 * Returns `null` when it cannot be drawn: no dates, an end before the start, or no points.
 * A sprint of fewer than two days is `'short'`.
 */
export function buildBurndown(
  startDate: string | null,
  endDate: string | null,
  todos: readonly Pick<Todo, 'storyPoints' | 'completedAt' | 'status'>[],
  today: string,
): Burndown | null | 'short' {
  if (startDate === null || endDate === null) return null;
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (start === null || end === null || end < start) return null;
  const total = todos.reduce((sum, todo) => sum + (todo.storyPoints ?? 0), 0);
  if (total === 0) return null;
  const length = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  if (length < 2) return 'short';

  const donePerDay = new Map<string, number>();
  for (const todo of todos) {
    if (todo.status !== 'done' || todo.completedAt === null) continue;
    // Anything finished before the sprint start counts on day one.
    const day = dayOf(todo.completedAt) < startDate ? startDate : dayOf(todo.completedAt);
    donePerDay.set(day, (donePerDay.get(day) ?? 0) + (todo.storyPoints ?? 0));
  }

  let burned = 0;
  let todayIndex: number | null = null;
  const days: BurndownPoint[] = [];
  for (let index = 0; index < length; index += 1) {
    const date = addDaysToDateOnly(startDate, index);
    const isFuture = date > today;
    if (date === today) todayIndex = index;
    burned += donePerDay.get(date) ?? 0;
    days.push({
      date,
      ideal: Math.round(total * (1 - index / (length - 1)) * 100) / 100,
      actual: isFuture ? null : Math.max(total - burned, 0),
    });
  }
  return { total, days, todayIndex };
}
