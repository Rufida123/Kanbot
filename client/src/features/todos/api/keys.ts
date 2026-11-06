import type { TodoPriority, TodoType } from '@/shared/types/api';

/** Every parameter that changes the response is part of the key (AI_RULES §7). */
export type TodoListFilters = {
  /** `'backlog'` or a sprint id. */
  sprintId: string;
  q: string;
  priority: TodoPriority | null;
  type: TodoType | null;
};

/**
 * `['todos', projectId, …]` starts with the prefix Sprint 2's project-delete cleanup removes.
 * `['todo', id]` is one todo (details dialog).
 */
export const todoKeys = {
  all: (projectId: string) => ['todos', projectId] as const,
  list: (projectId: string, filters: TodoListFilters) => ['todos', projectId, filters] as const,
  detail: (todoId: string) => ['todo', todoId] as const,
};

export const todoMutationKeys = {
  create: (projectId: string) => ['todo', 'create', projectId] as const,
  update: ['todo', 'update'] as const,
  delete: ['todo', 'delete'] as const,
  move: ['todo', 'move'] as const,
};
