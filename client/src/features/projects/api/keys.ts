/**
 * Query keys. Todo and sprint keys of a project start with `['todos', id]` / `['sprints', id]`
 * (Sprint 3+), so removing a deleted project's data by prefix already covers them.
 */
export const projectKeys = {
  all: ['projects'] as const,
  detail: (projectId: string) => ['project', projectId] as const,
  /** Cached data of a project that must disappear with it. */
  relatedPrefixes: (projectId: string) =>
    [
      ['project', projectId],
      ['todos', projectId],
      ['sprints', projectId],
    ] as const,
};

export const projectMutationKeys = {
  delete: ['projects', 'delete'] as const,
};
