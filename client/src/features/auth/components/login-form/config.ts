import type { TFunction } from 'i18next';
import { z } from 'zod';
import { AUTH_LIMITS } from '@/features/auth/config/limits';

/** Messages are translated when the schema is built (at render time), so they follow the language. */
export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth:validation.emailRequired'))
      .max(AUTH_LIMITS.emailMax, t('auth:validation.emailMax', { max: AUTH_LIMITS.emailMax }))
      .pipe(z.email(t('auth:validation.emailInvalid'))),
    // The server only requires a non-empty password on login (older accounts may be shorter).
    password: z
      .string()
      .min(1, t('auth:validation.passwordRequired'))
      .max(AUTH_LIMITS.passwordMax, t('auth:validation.passwordMax', { max: AUTH_LIMITS.passwordMax })),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export const loginDefaultValues: LoginFormValues = { email: '', password: '' };

export const loginFields = [
  'email',
  'password',
] as const satisfies readonly (keyof LoginFormValues)[];
