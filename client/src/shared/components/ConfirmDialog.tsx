import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useId } from 'react';
import type { ReactNode } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** What will happen. Name the thing being changed. */
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  isDestructive?: boolean;
  /** While true both buttons are disabled and the dialog cannot be dismissed. */
  isPending?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmation for destructive or irreversible actions. Esc, backdrop and Cancel all call `onCancel`. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  isDestructive = false,
  isPending = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const handleClose = () => {
    if (isPending) return;
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId} sx={{ overflowWrap: 'anywhere' }}>
        {title}
      </DialogTitle>
      <DialogContent
        id={descriptionId}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowWrap: 'anywhere' }}
      >
        {children}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button color="inherit" onClick={handleClose} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={isDestructive ? 'error' : 'primary'}
          onClick={onConfirm}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
