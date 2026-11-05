import { z } from 'zod';
import { AUTH_LIMITS } from '@/features/auth/config/limits';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(AUTH_LIMITS.emailMax, `Email must be at most ${AUTH_LIMITS.emailMax} characters`)
    .pipe(z.email('Enter a valid email address')),
  // The server only requires a non-empty password on login (older accounts may be shorter).
  password: z
    .string()
    .min(1, 'Password is required')
    .max(AUTH_LIMITS.passwordMax, `Password must be at most ${AUTH_LIMITS.passwordMax} characters`),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginDefaultValues: LoginFormValues = { email: '', password: '' };

export const loginFields = [
  'email',
  'password',
] as const satisfies readonly (keyof LoginFormValues)[];
