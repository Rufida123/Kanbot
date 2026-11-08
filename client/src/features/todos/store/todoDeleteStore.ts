import { create } from 'zustand';
import { softDeleteTodos } from '@/features/todos/utils/pendingDeletes';
import type { DeleteTarget } from '@/features/todos/utils/pendingDeletes';

export type TodoDeleteTarget = DeleteTarget;

type TodoDeleteActions = {
  /** Deletes with Undo (no confirm dialog): see `pendingDeletes.ts`. */
  request: (target: TodoDeleteTarget) => void;
};

export const useTodoDeleteStore = create<TodoDeleteActions>()(() => ({
  request: (target) => softDeleteTodos([target]),
}));
