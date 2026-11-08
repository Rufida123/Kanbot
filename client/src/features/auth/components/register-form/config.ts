import type { TFunction } from 'i18next';
import { z } from 'zod';
import { AUTH_LIMITS } from '@/features/auth/config/limits';

export function createRegisterSchema(t: TFunction) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('auth:validation.nameRequired'))
        .max(AUTH_LIMITS.nameMax, t('auth:validation.nameMax', { max: AUTH_LIMITS.nameMax })),
      email: z
        .string()
        .trim()
        .min(1, t('auth:validation.emailRequired'))
        .max(AUTH_LIMITS.emailMax, t('auth:validation.emailMax', { max: AUTH_LIMITS.emailMax }))
        .pipe(z.email(t('auth:validation.emailInvalid'))),
      password: z
        .string()
        .min(1, t('auth:validation.passwordRequired'))
        .min(AUTH_LIMITS.passwordMin, t('auth:validation.passwordMin', { min: AUTH_LIMITS.passwordMin }))
        .max(AUTH_LIMITS.passwordMax, t('auth:validation.passwordMax', { max: AUTH_LIMITS.passwordMax })),
      confirmPassword: z.string().min(1, t('auth:validation.confirmRequired')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t('auth:validation.passwordsMismatch'),
      path: ['confirmPassword'],
    });
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export const registerDefaultValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/** Fields the server can report errors for (confirmPassword is client-only). */
export const registerServerFields = [
  'name',
  'email',
  'password',
] as const satisfies readonly (keyof RegisterFormValues)[];
