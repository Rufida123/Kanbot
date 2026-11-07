/** Sprint keys start with `['sprints', projectId]`, so deleting a project removes them by prefix. */
export const sprintKeys = {
  all: (projectId: string) => ['sprints', projectId] as const,
  /** One sprint with its live or final numbers (details page). */
  detail: (sprintId: string) => ['sprint', sprintId] as const,
};
