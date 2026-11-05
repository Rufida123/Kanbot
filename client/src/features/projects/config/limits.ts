/** Limits come from server/src/routes/projects.routes.ts. */
export const PROJECT_LIMITS = {
  nameMax: 80,
  descriptionMax: 500,
  keyMin: 2,
  keyMax: 6,
} as const;
