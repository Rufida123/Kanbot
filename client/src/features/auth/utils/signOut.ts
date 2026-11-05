import { queryClient } from '@/shared/lib/queryClient';
import { useSessionStore } from '@/shared/stores/sessionStore';
import type { SignOutReason } from '@/shared/stores/sessionStore';

/** Clears the token, the user and every cached query. The route guards then show /login. */
export function signOut(reason: SignOutReason | null): void {
  useSessionStore.getState().endSession(reason);
  queryClient.clear();
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
