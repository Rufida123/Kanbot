import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      role="alert"
      sx={{ overflowWrap: 'anywhere' }}
      action={
        onRetry === undefined ? undefined : (
          <Button color="inherit" size="small" onClick={onRetry}>
            {t('common:actions.retry')}
          </Button>
        )
      }
    >
      {getAiErrorText(error)}
    </Alert>
  );
}
