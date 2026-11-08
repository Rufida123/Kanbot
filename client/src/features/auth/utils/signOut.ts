import { flushPendingDeletes } from '@/features/todos/utils/pendingDeletes';
import { clearUserPreferences } from '@/shared/lib/preferences';
import { queryClient } from '@/shared/lib/queryClient';
import { useSessionStore } from '@/shared/stores/sessionStore';
import type { SignOutReason } from '@/shared/stores/sessionStore';
import { useToastStore } from '@/shared/stores/toastStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { useAiChatStore } from '@/features/ai/store/aiChatStore';
import { useAiDialogStore } from '@/features/ai/store/aiDialogStore';
import { useProjectDialogStore } from '@/features/projects/store/projectDialogStore';

/**
 * Clears the token, the user, every cached query and the client stores (UI state, toasts,
 * open project dialogs, the AI conversation and dialog: the conversation contains project data,
 * so the next user of this browser must not see it). The route guards then show /login.
 */
export function signOut(reason: SignOutReason | null): void {
  // Delayed (undoable) deletes are sent while the token still exists.
  flushPendingDeletes();
  useSessionStore.getState().endSession(reason);
  queryClient.clear();
  useUiStore.getState().reset();
  useToastStore.getState().reset();
  useProjectDialogStore.getState().reset();
  useAiChatStore.getState().reset();
  useAiDialogStore.getState().reset();
  // Per-user data in `preferences.ts` (chat history, recent items). Theme and language stay.
  clearUserPreferences();
}

/**
 * Called by the API client for every 401 except a failed login (AUTH-6).
 * Idempotent: several requests failing at once end the session only once.
 * A 401 while the stored token is being verified at startup is silent (no "expired" message).
 */
export function expireSession(): void {
  const { status } = useSessionStore.getState();
  if (status === 'unauthenticated') return;
  signOut(status === 'authenticated' ? 'session-expired' : null);
}
