/** Only the JWT is stored by the base app (NFR-7); enhancement preferences live in `preferences.ts`. Never log it. */
const TOKEN_KEY = 'kanbot_token';

export function readToken(): string | null {
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    return token && token.length > 0 ? token : null;
  } catch {
    // Storage can be blocked (private mode, browser settings): behave as signed out.
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The session still works until the page is reloaded.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}
