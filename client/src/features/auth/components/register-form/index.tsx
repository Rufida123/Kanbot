import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { applyFieldErrors } from '@/features/auth/utils/applyFieldErrors';
import { AUTH_LIMITS } from '@/features/auth/config/limits';
import { ApiError } from '@/shared/api/client';
import { FormTextField } from '@/shared/components/FormTextField';
import {
  EMAIL_TAKEN_MESSAGE,
  registerDefaultValues,
  registerSchema,
  registerServerFields,
} from './config';
import type { RegisterFormValues } from './config';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: registerDefaultValues,
  });
  const { mutate, isPending } = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = handleSubmit(({ name, email, password }) => {
    if (isPending) return;
    setFormError(null);
    mutate(
      { name, email, password },
      {
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setError(
              'email',
              { type: 'server', message: EMAIL_TAKEN_MESSAGE },
              { shouldFocus: true },
            );
            return;
          }
          if (applyFieldErrors(error, setError, registerServerFields)) return;
          setFormError(
            error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
          );
        },
      },
    );
  });

  // Editing the password after the confirmation was touched re-checks the match.
  const passwordRegistration = register('password', {
    onChange: () => {
      if (touchedFields.confirmPassword) void trigger('confirmPassword');
    },
  });

  return (
    <Box
      component="form"
      noValidate
      onSubmit={onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
    >
      {formError ? <Alert severity="error">{formError}</Alert> : null}
      <FormTextField
        label="Name"
        isRequired
        autoComplete="name"
        placeholder="Your name"
        autoFocus
        registration={register('name')}
        error={errors.name}
      />
      <FormTextField
        label="Email"
        isRequired
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        registration={register('email')}
        error={errors.email}
      />
      <PasswordField
        label="Password"
        isRequired
        autoComplete="new-password"
        hint={`At least ${AUTH_LIMITS.passwordMin} characters`}
        registration={passwordRegistration}
        error={errors.password}
      />
      <PasswordField
        label="Confirm password"
        isRequired
        autoComplete="new-password"
        registration={register('confirmPassword')}
        error={errors.confirmPassword}
      />
      <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
        Create account
      </Button>
    </Box>
  );
}
