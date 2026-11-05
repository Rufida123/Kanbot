import { Navigate, Outlet, useSearchParams } from 'react-router';
import { REDIRECT_PARAM } from '@/app/navigation';
import { safeRedirect } from '@/features/auth/utils/redirect';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { useSessionStore } from '@/shared/stores/sessionStore';

/**
 * Guard for /login and /register (AUTH-5). Signed-in users go back to the page they
 * asked for (`?redirect=`, internal paths only) or to the projects page. This also
 * performs the navigation after a successful login or registration.
 */
export function GuestOnly() {
  const status = useSessionStore((state) => state.status);
  const [searchParams] = useSearchParams();

  if (status === 'checking') return <LoadingScreen label="Checking your session…" />;
  if (status === 'authenticated') {
    return <Navigate to={safeRedirect(searchParams.get(REDIRECT_PARAM))} replace />;
  }
  return <Outlet />;
}
