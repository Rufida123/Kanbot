import Typography from '@mui/material/Typography';
import { useState } from 'react';
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
      title="Delete sprint?"
      confirmLabel="Delete sprint"
      isDestructive
      isPending={deleteMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={() => void handleConfirm()}
      onCancel={onClose}
    >
      <Typography>
        <strong>{sprint.name}</strong> will be deleted.{' '}
        {todoCount === 0
          ? 'It has no todos.'
          : `${formatCount(todoCount, 'todo')} will return to the end of the backlog.`}
      </Typography>
    </ConfirmDialog>
  );
}
