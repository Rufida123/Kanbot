import WifiOffIcon from '@mui/icons-material/WifiOff';
import Alert from '@mui/material/Alert';
import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

function subscribe(listener: () => void): () => void {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

/** Shown while `navigator.onLine` is false (PWA, enhancement 25). */
export function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (isOnline) return null;
  return (
    <Alert severity="warning" icon={<WifiOffIcon aria-hidden="true" />} role="status" square sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar + 1 }}>
      {t('common:offline.banner')}
    </Alert>
  );
}
