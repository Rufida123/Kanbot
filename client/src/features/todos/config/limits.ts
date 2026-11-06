/** Limits come from server/src/routes/schemas.ts and todos.routes.ts. */
export const TODO_LIMITS = {
  titleMax: 200,
  descriptionMax: 5000,
  labelsMax: 10,
  labelMax: 30,
  searchMax: 100,
} as const;
