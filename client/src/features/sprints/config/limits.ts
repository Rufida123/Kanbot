/** Limits come from server/src/routes/sprints.routes.ts. */
export const SPRINT_LIMITS = {
  nameMax: 80,
  goalMax: 300,
} as const;

/** Length of a sprint started without an end date (the server uses the same default). */
export const DEFAULT_SPRINT_LENGTH_DAYS = 14;
