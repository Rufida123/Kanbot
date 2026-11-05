import { create } from 'zustand';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  message: string;
  severity: ToastSeverity;
};

/** Older toasts are dropped when more than this many are queued. */
const MAX_TOASTS = 4;

type ToastState = { toasts: readonly Toast[] };

type ToastActions = {
  show: (message: string, severity?: ToastSeverity) => void;
  dismiss: (id: string) => void;
  /** Removes every toast. Called on logout. */
  reset: () => void;
};

export const useToastStore = create<ToastState & ToastActions>()((set) => ({
  toasts: [],
  show: (message, severity = 'success') =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, severity }].slice(-MAX_TOASTS),
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  reset: () => set({ toasts: [] }),
}));

/** Use outside React (mutation callbacks): `showToast('Project created')`. */
export function showToast(message: string, severity: ToastSeverity = 'success'): void {
  useToastStore.getState().show(message, severity);
}
