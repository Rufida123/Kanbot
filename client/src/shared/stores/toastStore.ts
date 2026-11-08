import { create } from 'zustand';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export type ToastAction = { label: string; onClick: () => void };

export type Toast = {
  id: string;
  message: string;
  severity: ToastSeverity;
  /** e.g. "Undo". Pressing it dismisses the toast. */
  action?: ToastAction;
  /** Overrides the default auto-hide time. */
  durationMs?: number;
  /** Called when the toast goes away without its action being used (timeout or dismiss). */
  onExpire?: () => void;
};

export type ToastOptions = Pick<Toast, 'action' | 'durationMs' | 'onExpire'>;

/** Older toasts are dropped when more than this many are queued. */
const MAX_TOASTS = 4;

type ToastState = { toasts: readonly Toast[] };

type ToastActions = {
  show: (message: string, severity?: ToastSeverity, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  /** Removes every toast. Called on logout. */
  reset: () => void;
};

export const useToastStore = create<ToastState & ToastActions>()((set) => ({
  toasts: [],
  show: (message, severity = 'success', options = {}) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, severity, ...options }].slice(-MAX_TOASTS),
    }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  reset: () => set({ toasts: [] }),
}));

/** Use outside React (mutation callbacks): `showToast('Project created')`. */
export function showToast(
  message: string,
  severity: ToastSeverity = 'success',
  options?: ToastOptions,
): string {
  return useToastStore.getState().show(message, severity, options);
}
