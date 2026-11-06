/**
 * `staleTime` per query (documented in the Sprint 3 notes). The backlog changes with every
 * create, edit and drag, so it is the shortest. A single todo only changes when it is edited.
 */
export const BACKLOG_STALE_TIME_MS = 15_000;
export const TODO_DETAIL_STALE_TIME_MS = 30_000;
