import { create } from 'zustand';

/** Which AI dialog is open. Nothing else lives here: drafts stay in the dialog's own state. */
export type AiDialog = 'generate-todos' | 'plan-sprint';

type AiDialogState = {
  dialog: AiDialog | null;
  /** The element that opened the dialog, so focus can return to it on close. */
  trigger: HTMLElement | null;
};

type AiDialogActions = {
  openGenerateTodos: (trigger: HTMLElement | null) => void;
  openPlanSprint: (trigger: HTMLElement | null) => void;
  close: () => void;
  reset: () => void;
};

const initialState: AiDialogState = { dialog: null, trigger: null };

export const useAiDialogStore = create<AiDialogState & AiDialogActions>()((set, get) => ({
  ...initialState,
  openGenerateTodos: (trigger) => set({ dialog: 'generate-todos', trigger }),
  openPlanSprint: (trigger) => set({ dialog: 'plan-sprint', trigger }),
  close: () => {
    const { trigger } = get();
    set(initialState);
    if (trigger === null) return;
    // After the dialog has unmounted.
    requestAnimationFrame(() => {
      if (trigger.isConnected) trigger.focus();
    });
  },
  reset: () => set(initialState),
}));
