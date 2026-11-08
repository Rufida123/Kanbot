import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { applyFieldErrors } from '@/features/auth/utils/applyFieldErrors';
import { ApiError } from '@/shared/api/client';
import { FormTextField } from '@/shared/components/FormTextField';
import { useSessionStore } from '@/shared/stores/sessionStore';
import { createLoginSchema, loginDefaultValues, loginFields } from './config';
import type { LoginFormValues } from './config';

export function LoginForm() {
  const { t } = useTranslation();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
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
          error instanceof ApiError ? error.message : t('common:errors.generic'),
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
        <Alert severity="warning">{t('auth:login.sessionExpired')}</Alert>
      ) : null}
      <FormTextField
        label={t('auth:fields.email')}
        isRequired
        type="email"
        autoComplete="email"
        placeholder={t('auth:fields.emailPlaceholder')}
        autoFocus
        registration={register('email')}
        error={errors.email}
      />
      <PasswordField
        label={t('auth:fields.password')}
        isRequired
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password}
      />
      <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
        {t('auth:login.submit')}
      </Button>
    </Box>
  );
}
