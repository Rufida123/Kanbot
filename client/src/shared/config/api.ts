/** Request timeout. The AI endpoints get their own, longer timeout in Sprint 6. */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Login failures are 401s that mean "wrong credentials", not "expired session". */
export const AUTH_LOGIN_PATH = '/auth/login';
export const AUTH_REGISTER_PATH = '/auth/register';
export const AUTH_ME_PATH = '/auth/me';
