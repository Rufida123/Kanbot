import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Extra actions next to the retry button (for example a link home). */
  actions?: ReactNode;
  /** Centre the state in the whole viewport instead of its container. */
  isFullPage?: boolean;
};

/** Error view for any data or page failure: says what happened and offers a way out. */
export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  actions,
  isFullPage = false,
}: ErrorStateProps) {
  return (
    <Box
      role="alert"
      sx={{
        minHeight: isFullPage ? '100dvh' : undefined,
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <ErrorOutlinedIcon color="error" fontSize="large" aria-hidden="true" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: '28rem' }}>
        <Typography component="h1" variant="h3">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
      {onRetry || actions ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
          {onRetry ? (
            <Button variant="contained" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {actions}
        </Box>
      ) : null}
    </Box>
  );
}
