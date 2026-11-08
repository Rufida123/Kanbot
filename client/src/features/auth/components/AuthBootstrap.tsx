import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { authKeys, getMe } from '@/features/auth/api/auth';
import { expireSession, signOut } from '@/features/auth/utils/signOut';
import { ApiError, setUnauthorizedHandler } from '@/shared/api/client';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { queryClient } from '@/shared/lib/queryClient';
import { useSessionStore } from '@/shared/stores/sessionStore';

/**
 * Wraps the whole app (AUTH-3). With a stored token it calls `GET /auth/me` while a
 * full-page loader is shown, so a signed-in user never sees a flash of the login page.
 * - 200: signed in. - 401: token cleared, login page. - network/5xx: the token is
 *   kept and the user can retry (a server outage must not log anyone out).
 */
export function AuthBootstrap({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const status = useSessionStore((state) => state.status);
  const restoreSession = useSessionStore((state) => state.restoreSession);
  const [startupError, setStartupError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Declared before the check below so the handler exists when its request runs.
  useEffect(() => {
    setUnauthorizedHandler(expireSession);
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (status !== 'checking') return;
    let isCurrent = true;

    queryClient
      .fetchQuery({
        queryKey: authKeys.me,
        queryFn: ({ signal }) => getMe(signal),
        staleTime: 0,
        retry: false,
      })
      .then((user) => {
        if (isCurrent) restoreSession(user);
      })
      .catch((error: unknown) => {
        // A 401 was already handled by the API client (token cleared, status changed).
        if (!isCurrent || (error instanceof ApiError && error.status === 401)) return;
        setStartupError(
          error instanceof ApiError
            ? error
            : new ApiError({
                status: null,
                code: 'UNEXPECTED_RESPONSE',
                message: t('common:errors.generic'),
              }),
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [status, attempt, restoreSession, t]);

  if (status !== 'checking') return children;

  if (startupError) {
    return (
      <ErrorState
        isFullPage
        title={t('auth:bootstrap.title')}
        message={startupError.message}
        onRetry={() => {
          setStartupError(null);
          setAttempt((current) => current + 1);
        }}
        actions={
          <Button variant="outlined" onClick={() => signOut(null)}>
            {t('auth:bootstrap.goToLogin')}
          </Button>
        }
      />
    );
  }

  return <LoadingScreen label={t('common:app.checkingSession')} />;
}
