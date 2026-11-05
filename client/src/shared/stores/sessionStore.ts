import { create } from 'zustand';
import { clearToken, readToken, saveToken } from '@/shared/lib/tokenStorage';
import type { AuthResponse, User } from '@/shared/types/api';

export type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated';

/** Why the user is signed out. Drives the message on the login page and the redirect. */
export type SignOutReason = 'session-expired' | 'logout';

type SessionState = {
  token: string | null;
  user: User | null;
  status: SessionStatus;
  signOutReason: SignOutReason | null;
};

type SessionActions = {
  /** Login or register succeeded. */
  startSession: (auth: AuthResponse) => void;
  /** `GET /auth/me` succeeded on startup. */
  restoreSession: (user: User) => void;
  /** Clears the token and the user. Idempotent. */
  endSession: (reason: SignOutReason | null) => void;
};

function buildInitialState(): SessionState {
  const token = readToken();
  return {
    token,
    user: null,
    // With a stored token the app verifies it with /auth/me before showing anything.
    status: token ? 'checking' : 'unauthenticated',
    signOutReason: null,
  };
}

export const useSessionStore = create<SessionState & SessionActions>()((set) => ({
  ...buildInitialState(),
  startSession: ({ token, user }) => {
    saveToken(token);
    set({ token, user, status: 'authenticated', signOutReason: null });
  },
  restoreSession: (user) => {
    set({ user, status: 'authenticated', signOutReason: null });
  },
  endSession: (reason) => {
    clearToken();
    set({ token: null, user: null, status: 'unauthenticated', signOutReason: reason });
  },
}));
