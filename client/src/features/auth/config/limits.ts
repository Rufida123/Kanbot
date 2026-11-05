/** Server limits come from server/src/routes/auth.routes.ts. The email cap is client-only (RFC 5321). */
export const AUTH_LIMITS = {
  nameMax: 80,
  emailMax: 254,
  passwordMin: 8,
  passwordMax: 200,
} as const;
