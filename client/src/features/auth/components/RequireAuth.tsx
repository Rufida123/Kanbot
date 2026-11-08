import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router';
import { buildLoginPath } from '@/features/auth/utils/redirect';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { useSessionStore } from '@/shared/stores/sessionStore';

/**
 * Guard for private pages (AUTH-5). This is UX only: the server decides authorization.
 * Also reacts to a session that ends while the user is on the page (logout, expired token).
 */
export function RequireAuth() {
  const { t } = useTranslation();
  const status = useSessionStore((state) => state.status);
  const signOutReason = useSessionStore((state) => state.signOutReason);
  const location = useLocation();

  if (status === 'checking') return <LoadingScreen label={t('common:app.checkingSession')} />;
  if (status === 'unauthenticated') {
    const loginPath = buildLoginPath(location, { isLogout: signOutReason === 'logout' });
    return <Navigate to={loginPath} replace />;
  }
  return <Outlet />;
}
