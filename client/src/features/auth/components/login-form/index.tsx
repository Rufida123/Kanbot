import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { applyFieldErrors } from '@/features/auth/utils/applyFieldErrors';
import { ApiError } from '@/shared/api/client';
import { FormTextField } from '@/shared/components/FormTextField';
import { useSessionStore } from '@/shared/stores/sessionStore';
import { loginDefaultValues, loginFields, loginSchema } from './config';
import type { LoginFormValues } from './config';

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: loginDefaultValues,
  });
  const { mutate, isPending } = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const isSessionExpired = useSessionStore((state) => state.signOutReason === 'session-expired');

  const onSubmit = handleSubmit((values) => {
    if (isPending) return;
    setFormError(null);
    mutate(values, {
      onError: (error) => {
        if (applyFieldErrors(error, setError, loginFields)) return;
        setFormError(
          error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
        );
      },
    });
  });

  return (
    <Box
      component="form"
      noValidate
      onSubmit={onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
    >
      {formError ? (
        <Alert severity="error">{formError}</Alert>
      ) : isSessionExpired ? (
        <Alert severity="warning">{SESSION_EXPIRED_MESSAGE}</Alert>
      ) : null}
      <FormTextField
        label="Email"
        isRequired
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        autoFocus
        registration={register('email')}
        error={errors.email}
      />
      <PasswordField
        label="Password"
        isRequired
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password}
      />
      <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
        Log in
      </Button>
    </Box>
  );
}
