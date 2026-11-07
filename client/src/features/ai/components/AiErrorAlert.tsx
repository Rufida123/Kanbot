import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { AI_RETRY_LABEL } from '@/features/ai/config/copy';
import { getAiErrorText } from '@/features/ai/utils/getAiErrorText';

type AiErrorAlertProps = {
  error: unknown;
  /** Absent: no button (the user fixes something else first). The call is never retried by itself. */
  onRetry?: () => void;
};

/**
 * The one error view of every AI surface (AI-5): the server's message with a friendly prefix and a
 * "Try again" button. `ErrorState` is for whole-page failures and does not belong in the drawer.
 */
export function AiErrorAlert({ error, onRetry }: AiErrorAlertProps) {
  return (
    <Alert
      severity="error"
      role="alert"
      sx={{ overflowWrap: 'anywhere' }}
      action={
        onRetry === undefined ? undefined : (
          <Button color="inherit" size="small" onClick={onRetry}>
            {AI_RETRY_LABEL}
          </Button>
        )
      }
    >
      {getAiErrorText(error)}
    </Alert>
  );
}
