import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import type { FormEventHandler, ReactNode } from 'react';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';

type TodoDialogFrameProps = {
  /** "KAN-12", or null while it is unknown. */
  todoKey: string | null;
  subtitle?: string;
  /** Esc, backdrop click and the X button. */
  onClose: () => void;
  /** Present: the body is a `<form>` and this runs on submit. */
  onSubmit?: FormEventHandler<HTMLFormElement>;
  isBusy?: boolean;
  /** True when this frame replaces the loading frame: no second fade-in of the backdrop. */
  isReplacingLoader?: boolean;
  children: ReactNode;
};

/**
 * Shell shared by every state of the details dialog (loading, error, form): header with the
 * key and a close button, then the body. Full screen below 600px. The scrolling body and the
 * action row are the children's job (`DialogContent` + `DialogActions`).
 */
export function TodoDialogFrame({
  todoKey,
  subtitle,
  onClose,
  onSubmit,
  isBusy = false,
  isReplacingLoader = false,
  children,
}: TodoDialogFrameProps) {
  const titleId = useId();
  const isSmallScreen = useIsSmallScreen();
  const theme = useTheme();
  return (
    <Dialog
      open
      onClose={onClose}
      scroll="paper"
      fullWidth
      maxWidth="md"
      fullScreen={isSmallScreen}
      transitionDuration={
        isReplacingLoader ? { enter: 0, exit: theme.transitions.duration.leavingScreen } : undefined
      }
      aria-labelledby={titleId}
      aria-busy={isBusy}
    >
      <Box
        component={onSubmit ? 'form' : 'div'}
        noValidate={onSubmit ? true : undefined}
        onSubmit={onSubmit}
        // Lets the body shrink and scroll while the header and the action row stay in view.
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogTitle
          component="div"
          id={titleId}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, paddingBlock: 1.5 }}
        >
          {todoKey ? <Chip label={todoKey} size="small" color="primary" /> : null}
          <Typography component="h2" variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 0 }} noWrap>
            {subtitle ?? 'Todo details'}
          </Typography>
          <Tooltip title="Close">
            <IconButton edge="end" aria-label="Close" onClick={onClose}>
              <CloseIcon aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        {children}
      </Box>
    </Dialog>
  );
}
