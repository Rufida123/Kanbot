import Link from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router';
import { paths } from '@/app/navigation';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  const { search } = useLocation();
  return (
    <AuthLayout
      title="Create your account"
      documentTitle="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link component={RouterLink} to={{ pathname: paths.login, search }}>
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
