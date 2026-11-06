import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import { useToastStore } from '@/shared/stores/toastStore';
import type { Toast } from '@/shared/stores/toastStore';

const AUTO_HIDE_MS = 5_000;
/** Errors stay longer: they are harder to read and often need a decision. */
const AUTO_HIDE_ERROR_MS = 8_000;

type ToastItemProps = { toast: Toast };

function ToastItem({ toast }: ToastItemProps) {
  const dismiss = useToastStore((state) => state.dismiss);
  const { id, severity } = toast;

  useEffect(() => {
    const timer = setTimeout(
      () => dismiss(id),
      severity === 'error' ? AUTO_HIDE_ERROR_MS : AUTO_HIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [id, severity, dismiss]);

  return (
    <Alert
      // Errors interrupt screen readers; everything else is announced politely.
      role={severity === 'error' ? 'alert' : 'status'}
      severity={severity}
      variant="filled"
      onClose={() => dismiss(id)}
      sx={{ pointerEvents: 'auto', boxShadow: (theme) => theme.shadows[8] }}
    >
      {toast.message}
    </Alert>
  );
}

/** Renders the toast queue. Mount once, inside the theme provider. */
export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  if (toasts.length === 0) return null;
  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: theme.zIndex.snackbar,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        padding: 2,
        // The container never blocks clicks on the page; only the toasts do.
        pointerEvents: 'none',
      })}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </Box>
  );
}
