import type { Todo, TodoStatus } from '@/shared/types/api';

/** The four board columns, as the API returns them. */
export type BoardColumns = Readonly<Record<TodoStatus, readonly Todo[]>>;

export type SprintProgress = {
  donePoints: number;
  totalPoints: number;
  doneTodos: number;
  totalTodos: number;
  /** 0–100, 0 when there are no points. */
  pointsPercent: number;
  /** 0–100, 0 when there are no todos. */
  todosPercent: number;
};

/** A whole-number percentage that never divides by zero. */
export function toPercent(part: number, total: number): number {
  if (total <= 0) return 0;
  const percent = Math.round((part / total) * 100);
  return Number.isFinite(percent) ? percent : 0;
}

/** Story points of a list of todos (not estimated counts as 0, as on the server). */
export function getColumnPoints(todos: readonly Todo[]): number {
  return todos.reduce((sum, todo) => sum + (todo.storyPoints ?? 0), 0);
}

function getAllTodos(columns: BoardColumns): Todo[] {
  return Object.values(columns).flat();
}

/** Progress of the sprint, derived from the cards so it follows every drag at once. */
export function calculateProgress(columns: BoardColumns): SprintProgress {
  const totalPoints = getColumnPoints(getAllTodos(columns));
  const donePoints = getColumnPoints(columns.done);
  const totalTodos = getAllTodos(columns).length;
  const doneTodos = columns.done.length;
  return {
    donePoints,
    totalPoints,
    doneTodos,
    totalTodos,
    pointsPercent: toPercent(donePoints, totalPoints),
    todosPercent: toPercent(doneTodos, totalTodos),
  };
}

/** True when the bar can follow points; otherwise it follows the todo ratio. */
export function hasPointsEstimate(progress: SprintProgress): boolean {
  return progress.totalPoints > 0;
}

export function getProgressPercent(progress: SprintProgress): number {
  return hasPointsEstimate(progress) ? progress.pointsPercent : progress.todosPercent;
}

/** "8 of 21 points, 38%", or "3 of 8 todos, 38%" when nothing is estimated. */
export function getProgressSummary(progress: SprintProgress): string {
  const percent = getProgressPercent(progress);
  if (hasPointsEstimate(progress)) {
    return `${progress.donePoints} of ${progress.totalPoints} points, ${percent}%`;
  }
  return `${progress.doneTodos} of ${progress.totalTodos} todos, ${percent}%`;
}

/** Todos that are not in the Done column. */
export function getUnfinishedCount(columns: BoardColumns): number {
  return getAllTodos(columns).length - columns.done.length;
}
