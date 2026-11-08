import { addDaysToDateOnly, getTodayDateOnly } from '@/shared/utils/formatDate';
import type { Todo } from '@/shared/types/api';

export type Standup = { yesterday: Todo[]; today: Todo[]; blockers: Todo[] };

function localDay(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Last working day before `today`: Monday looks back to Friday, Sunday to Friday, otherwise yesterday. */
export function getPreviousWorkday(today: string): string {
  const [year, month, day] = today.split('-').map(Number) as [number, number, number];
  const weekday = new Date(year, month - 1, day).getDay();
  const back = weekday === 1 ? 3 : weekday === 0 ? 2 : 1;
  return addDaysToDateOnly(today, -back);
}

/**
 * Stand-up helper (enhancement 19). Yesterday: todos with a `completedAt` since the last working
 * day. Today: todos in progress or in review. Blockers: open todos labelled "blocked" or overdue.
 */
export function buildStandup(todos: readonly Todo[], today: string = getTodayDateOnly()): Standup {
  const since = getPreviousWorkday(today);
  const yesterday = todos.filter((todo) => {
    if (todo.status !== 'done' || todo.completedAt === null) return false;
    const day = localDay(todo.completedAt);
    return day >= since && day < today;
  });
  const current = todos.filter((todo) => todo.status === 'in_progress' || todo.status === 'in_review');
  const blockers = todos.filter(
    (todo) =>
      todo.status !== 'done' &&
      (todo.labels.some((label) => label.trim().toLowerCase() === 'blocked') || (todo.dueDate !== null && todo.dueDate < today)),
  );
  return { yesterday, today: current, blockers };
}
