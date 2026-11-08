import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect, useRef } from 'react';
import { useToastStore } from '@/shared/stores/toastStore';
import type { Toast } from '@/shared/stores/toastStore';

const AUTO_HIDE_MS = 5_000;
/** Errors stay longer: they are harder to read and often need a decision. */
const AUTO_HIDE_ERROR_MS = 8_000;
/** Toasts with an action ("Undo") stay about 6 seconds (enhancement 4). */
export const UNDO_TOAST_MS = 6_000;

type ToastItemProps = { toast: Toast };

function ToastItem({ toast }: ToastItemProps) {
  const dismiss = useToastStore((state) => state.dismiss);
  const { id, severity, action, onExpire } = toast;
  // The callback is read through a ref so a re-render never restarts the timer.
  const expireRef = useRef(onExpire);
  const isActionUsedRef = useRef(false);
  expireRef.current = onExpire;
  const duration =
    toast.durationMs ?? (action ? UNDO_TOAST_MS : severity === 'error' ? AUTO_HIDE_ERROR_MS : AUTO_HIDE_MS);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, dismiss]);

  useEffect(
    () => () => {
      if (!isActionUsedRef.current) expireRef.current?.();
    },
    [],
  );

  return (
    <Alert
      // Errors interrupt screen readers; everything else is announced politely.
      role={severity === 'error' ? 'alert' : 'status'}
      severity={severity}
      variant="filled"
      onClose={() => dismiss(id)}
      action={
        action ? (
          <ToastActionButton
            label={action.label}
            onClick={() => {
              isActionUsedRef.current = true;
              action.onClick();
              dismiss(id);
            }}
          />
        ) : undefined
      }
      sx={{ pointerEvents: 'auto', boxShadow: (theme) => theme.shadows[8] }}
    >
      {toast.message}
    </Alert>
  );
}

function ToastActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button color="inherit" size="small" onClick={onClick} sx={{ fontWeight: 'fontWeightBold' }}>
      {label}
    </Button>
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
        // Above the mobile bottom navigation and the iOS home indicator.
        paddingBottom: { xs: 'calc(4.5rem + env(safe-area-inset-bottom))', md: 2 },
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
