import { create } from 'zustand';
import type { Todo } from '@/shared/types/api';

/** The minimum the confirmation needs: never the whole todo (AI_RULES §6). */
export type TodoDeleteTarget = Pick<Todo, 'id' | 'projectId' | 'key' | 'title'>;

type TodoDeleteState = { target: TodoDeleteTarget | null };

type TodoDeleteActions = {
  request: (target: TodoDeleteTarget) => void;
  clear: () => void;
};

/** Row menus and the details dialog ask for a deletion here; `TodoDetailsHost` shows the confirmation. */
export const useTodoDeleteStore = create<TodoDeleteState & TodoDeleteActions>()((set) => ({
  target: null,
  request: (target) => set({ target: { id: target.id, projectId: target.projectId, key: target.key, title: target.title } }),
  clear: () => set({ target: null }),
}));
