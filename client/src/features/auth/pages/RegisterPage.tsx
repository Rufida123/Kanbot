import { useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router';
import { paths } from '@/app/navigation';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { search } = useLocation();
  return (
    <AuthLayout
      title={t('auth:register.title')}
      documentTitle={t('auth:register.documentTitle')}
      footer={
        <>
          {t('auth:register.haveAccount')}{' '}
          <Link component={RouterLink} to={{ pathname: paths.login, search }}>
            {t('auth:register.logIn')}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
