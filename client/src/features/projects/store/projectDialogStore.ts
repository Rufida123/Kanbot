import { create } from 'zustand';

/** Only ids live here; the project data itself stays in React Query. */
export type ProjectDialog =
  | { type: 'create' }
  | { type: 'edit'; projectId: string }
  | { type: 'delete'; projectId: string };

type ProjectDialogState = {
  dialog: ProjectDialog | null;
  /** The element that opened the dialog, so focus can return to it on close. */
  trigger: HTMLElement | null;
};

type ProjectDialogActions = {
  openCreate: (trigger: HTMLElement | null) => void;
  openEdit: (projectId: string, trigger: HTMLElement | null) => void;
  openDelete: (projectId: string, trigger: HTMLElement | null) => void;
  close: () => void;
  reset: () => void;
};

const initialState: ProjectDialogState = { dialog: null, trigger: null };

export const useProjectDialogStore = create<ProjectDialogState & ProjectDialogActions>()(
  (set, get) => ({
    ...initialState,
    openCreate: (trigger) => set({ dialog: { type: 'create' }, trigger }),
    openEdit: (projectId, trigger) => set({ dialog: { type: 'edit', projectId }, trigger }),
    openDelete: (projectId, trigger) => set({ dialog: { type: 'delete', projectId }, trigger }),
    close: () => {
      const { trigger } = get();
      set(initialState);
      if (trigger === null) return;
      // After the dialog has unmounted. The trigger is gone if its project was deleted.
      requestAnimationFrame(() => {
        if (trigger.isConnected) trigger.focus();
      });
    },
    reset: () => set(initialState),
  }),
);
