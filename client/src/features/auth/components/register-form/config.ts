import { z } from 'zod';
import { AUTH_LIMITS } from '@/features/auth/config/limits';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(AUTH_LIMITS.nameMax, `Name must be at most ${AUTH_LIMITS.nameMax} characters`),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .max(AUTH_LIMITS.emailMax, `Email must be at most ${AUTH_LIMITS.emailMax} characters`)
      .pipe(z.email('Enter a valid email address')),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(
        AUTH_LIMITS.passwordMin,
        `Password must be at least ${AUTH_LIMITS.passwordMin} characters`,
      )
      .max(
        AUTH_LIMITS.passwordMax,
        `Password must be at most ${AUTH_LIMITS.passwordMax} characters`,
      ),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

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

export const EMAIL_TAKEN_MESSAGE = 'An account with this email already exists';
