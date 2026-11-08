import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useDeleteTodo } from '@/features/todos/hooks/useDeleteTodo';
import { useTodoDialogParam } from '@/features/todos/hooks/useTodoDialogParam';
import { useTodoDeleteStore } from '@/features/todos/store/todoDeleteStore';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

/**
 * Confirmation for deleting a todo, opened from a row menu or from the details dialog through
 * `todoDeleteStore`. The delete itself is optimistic: the dialog closes at once, the row leaves
 * the list, and it comes back with a toast if the request fails.
 */
export function TodoDeleteConfirm() {
  const { t } = useTranslation(['todos']);
  const target = useTodoDeleteStore((state) => state.target);
  const clear = useTodoDeleteStore((state) => state.clear);
  const { todoId: openTodoId, closeTodo } = useTodoDialogParam();
  const deleteMutation = useDeleteTodo();

  if (target === null) return null;

  const handleConfirm = () => {
    clear();
    // Leave the details of the deleted todo first; its cache is removed once nothing shows it.
    if (openTodoId === target.id) closeTodo();
    deleteMutation.mutate({ id: target.id, projectId: target.projectId });
  };

  return (
    <ConfirmDialog
      open
      title={t('todos:todoDeleteConfirm.confirmTitle')}
      confirmLabel={t('todos:todoDeleteConfirm.confirmLabel')}
      isDestructive
      onConfirm={handleConfirm}
      onCancel={clear}
    >
      <Typography>
        {t('todos:todoDeleteConfirm.message2', { key: target.key, title: target.title })}
      </Typography>
    </ConfirmDialog>
  );
}

