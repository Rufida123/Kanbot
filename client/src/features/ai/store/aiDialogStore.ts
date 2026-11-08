import { create } from 'zustand';

export type AiDialog = 'generate-todos' | 'plan-sprint' | 'improve-todo' | 'estimate' | 'standup';

type AiDialogState = {
  dialog: AiDialog | null;
  trigger: HTMLElement | null;
  /** The todo to improve (`improve-todo`). */
  todoId: string | null;
};

type AiDialogActions = {
  openGenerateTodos: (trigger: HTMLElement | null) => void;
  openPlanSprint: (trigger: HTMLElement | null) => void;
  openImproveTodo: (todoId: string, trigger: HTMLElement | null) => void;
  openEstimate: (trigger: HTMLElement | null) => void;
  openStandup: (trigger: HTMLElement | null) => void;
  /** Closes the dialog and returns focus to whatever opened it. */
  close: () => void;
  /** Back to the initial state. Called on logout. */
  reset: () => void;
};

const initialState: AiDialogState = { dialog: null, trigger: null, todoId: null };

export const useAiDialogStore = create<AiDialogState & AiDialogActions>()((set, get) => ({
  ...initialState,
  openGenerateTodos: (trigger) => set({ dialog: 'generate-todos', trigger, todoId: null }),
  openPlanSprint: (trigger) => set({ dialog: 'plan-sprint', trigger, todoId: null }),
  openImproveTodo: (todoId, trigger) => set({ dialog: 'improve-todo', trigger, todoId }),
  openEstimate: (trigger) => set({ dialog: 'estimate', trigger, todoId: null }),
  openStandup: (trigger) => set({ dialog: 'standup', trigger, todoId: null }),
  close: () => {
    const { trigger } = get();
    set(initialState);
    if (trigger === null) return;
    // Focus returns after the dialog has unmounted.
    requestAnimationFrame(() => {
      if (trigger.isConnected) trigger.focus();
    });
  },
  reset: () => set(initialState),
}));
