/** Sprints change only through sprint actions (Sprint 4+), so 30 s keeps the select instant. */
export const SPRINT_LIST_STALE_TIME_MS = 30_000;

/** The details page shows live numbers of an active sprint, so it is as short-lived as the board. */
export const SPRINT_DETAIL_STALE_TIME_MS = 15_000;
