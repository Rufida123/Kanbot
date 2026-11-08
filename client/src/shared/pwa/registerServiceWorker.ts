import { t } from '@/shared/i18n';
import { showToast } from '@/shared/stores/toastStore';

/**
 * PWA (app shell only). The service worker precaches the built JS/CSS/HTML and NEVER caches API
 * responses or tokens (see `vite.config.ts` in the README). Updates show an "Update" toast.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  void import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const update = registerSW({
        onNeedRefresh: () => {
          showToast(t('common:pwa.updateAvailable'), 'info', {
            durationMs: 30_000,
            action: { label: t('common:pwa.update'), onClick: () => void update(true) },
          });
        },
        onOfflineReady: () => showToast(t('common:pwa.offlineReady'), 'info'),
      });
    })
    .catch(() => {
      // The app works without a service worker.
    });
}
