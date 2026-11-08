import { useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router';
import { paths } from '@/app/navigation';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  const { t } = useTranslation();
  // Keep `?redirect=` when switching to the other auth page.
  const { search } = useLocation();
  return (
    <AuthLayout
      title={t('auth:login.title')}
      documentTitle={t('auth:login.documentTitle')}
      footer={
        <>
          {t('auth:login.noAccount')}{' '}
          <Link component={RouterLink} to={{ pathname: paths.register, search }}>
            {t('auth:login.createOne')}
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
