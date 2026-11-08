import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { env } from '@/shared/config/env';
import { useSessionStore } from '@/shared/stores/sessionStore';
import { flushPendingDeletes, flushPendingDeletesOnUnload } from '@/features/todos/utils/pendingDeletes';

/** Commits waiting soft deletes on route change and when the tab is closed (enhancement 4). */
export function useFlushDeletes(): void {
  const { pathname } = useLocation();
  useEffect(() => () => flushPendingDeletes(), [pathname]);
  useEffect(() => {
    const onPageHide = () =>
      flushPendingDeletesOnUnload((todoId) => {
        const { token } = useSessionStore.getState();
        void fetch(`${env.apiUrl}/todos/${todoId}`, {
          method: 'DELETE',
          keepalive: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => undefined);
      });
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);
}
