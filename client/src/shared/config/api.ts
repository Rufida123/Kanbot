/** Request timeout. The AI endpoints use `AI_REQUEST_TIMEOUT_MS` instead. */
export const REQUEST_TIMEOUT_MS = 15_000;

/** A real model needs 1–10 s and sometimes more, so every AI request waits longer than the default. */
export const AI_REQUEST_TIMEOUT_MS = 60_000;

/** Login failures are 401s that mean "wrong credentials", not "expired session". */
export const AUTH_LOGIN_PATH = '/auth/login';
export const AUTH_REGISTER_PATH = '/auth/register';
export const AUTH_ME_PATH = '/auth/me';
