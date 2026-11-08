import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDeleteSprint } from '@/features/backlog/hooks/useDeleteSprint';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { Sprint } from '@/shared/types/api';
import { formatCount } from '@/shared/utils/formatCount';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

type DeleteSprintDialogProps = {
  projectId: string;
  sprint: Sprint;
  todoCount: number;
  onClose: () => void;
};

/** Confirmation for deleting a planned sprint (SPR-2): its todos return to the backlog. */
export function DeleteSprintDialog({ projectId, sprint, todoCount, onClose }: DeleteSprintDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteSprint(projectId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync({ sprintId: sprint.id, name: sprint.name });
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <ConfirmDialog
      open
      title={t('backlog:sprint.deleteTitle')}
      confirmLabel={t('backlog:sprint.delete')}
      isDestructive
      isPending={deleteMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={() => void handleConfirm()}
      onCancel={onClose}
    >
      <Typography>
        <Trans
          i18nKey="backlog:sprint.deleteBody"
          values={{
            name: sprint.name,
            detail:
              todoCount === 0
                ? t('backlog:sprint.deleteNoTodos')
                : t('backlog:sprint.deleteWithTodos', { todos: formatCount(todoCount, 'todo') }),
          }}
          components={{ strong: <strong dir="auto" /> }}
        />
      </Typography>
    </ConfirmDialog>
  );
}
