import Link from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router';
import { paths } from '@/app/navigation';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  // Keep `?redirect=` when switching to the other auth page.
  const { search } = useLocation();
  return (
    <AuthLayout
      title="Welcome back"
      documentTitle="Log in"
      footer={
        <>
          No account?{' '}
          <Link component={RouterLink} to={{ pathname: paths.register, search }}>
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
