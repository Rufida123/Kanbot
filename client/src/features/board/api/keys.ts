/** Board data of one sprint. The board itself arrives in Sprint 5; todo edits already invalidate it. */
export const boardKeys = {
  detail: (sprintId: string) => ['board', sprintId] as const,
};
