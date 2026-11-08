import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Skeleton from '@mui/material/Skeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { TodoDialogFrame } from '@/features/todos/components/todo-details-dialog/TodoDialogFrame';

type TodoDialogLoadingProps = {
  /** Known from the cached list while the detail request runs. */
  todoKey: string | null;
  onClose: () => void;
};

/** Same layout as the form, shown while the todo loads (the dialog never appears empty). */
export function TodoDialogLoading({ todoKey, onClose }: TodoDialogLoadingProps) {
  const { t } = useTranslation();
  return (
    <TodoDialogFrame todoKey={todoKey} onClose={onClose} isBusy>
      <DialogContent dividers role="status" aria-label={t('todos:form.loading')} sx={{ paddingBlock: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.6fr) minmax(0, 1fr)' },
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" height="2.75rem" />
            <Skeleton variant="rounded" height="12rem" />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height="2.75rem" />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button color="inherit" onClick={onClose}>
          {t('common:actions.close')}
        </Button>
      </DialogActions>
    </TodoDialogFrame>
  );
}

type TodoDialogErrorProps = {
  isReplacingLoader: boolean;
  isNotFound: boolean;
  message: string;
  onRetry: () => void;
  onClose: () => void;
};

/** Unknown id, deleted in another tab, or a failed request: always with a way out (Close). */
export function TodoDialogError({
  isReplacingLoader,
  isNotFound,
  message,
  onRetry,
  onClose,
}: TodoDialogErrorProps) {
  const { t } = useTranslation();
  return (
    <TodoDialogFrame todoKey={null} onClose={onClose} isReplacingLoader={isReplacingLoader}>
      <DialogContent dividers>
        <ErrorState
          title={isNotFound ? t('todos:form.notFound') : t('todos:form.loadError')}
          message={isNotFound ? t('todos:form.notFoundMessage') : message}
          onRetry={isNotFound ? undefined : onRetry}
        />
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button variant="contained" onClick={onClose}>
          {t('common:actions.close')}
        </Button>
      </DialogActions>
    </TodoDialogFrame>
  );
}
