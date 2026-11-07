export const aiKeys = {
  /** The status never changes while the app runs: it is requested once. */
  status: ['ai-status'] as const,
};

/** AI calls are mutations. The keys let a component ask "is a summary running anywhere?". */
export const aiMutationKeys = {
  chat: (projectId: string) => ['ai', 'chat', projectId] as const,
  generateTodos: (projectId: string) => ['ai', 'generate-todos', projectId] as const,
  planSprint: (projectId: string) => ['ai', 'plan-sprint', projectId] as const,
  sprintSummary: ['ai', 'sprint-summary'] as const,
};
