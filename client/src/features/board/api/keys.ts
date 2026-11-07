/**
 * Board data of one sprint. This file must stay a leaf (no imports): `features/todos` imports
 * it to refresh boards, and the board imports `todos`.
 */
export const boardKeys = {
  /** Prefix of every cached board. */
  all: ['board'] as const,
  detail: (sprintId: string) => ['board', sprintId] as const,
};
