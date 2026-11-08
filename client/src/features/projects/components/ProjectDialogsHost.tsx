import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { ProjectFormDialog } from '@/features/projects/components/project-form-dialog';
import { useDeleteProject } from '@/features/projects/hooks/useDeleteProject';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectDialogStore } from '@/features/projects/store/projectDialogStore';
import { ApiError } from '@/shared/api/client';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';


/**
 * Renders the create, edit and delete dialogs. Mounted once in the app shell, so the page,
 * the cards and the sidebar all open the same dialogs through `projectDialogStore`.
 */
export function ProjectDialogsHost() {
  const { t } = useTranslation();
  const dialog = useProjectDialogStore((state) => state.dialog);
  const close = useProjectDialogStore((state) => state.close);
  const { data: projects, isSuccess } = useProjects();
  const navigate = useNavigate();
  const currentProjectId = useParams()[PROJECT_ID_PARAM];
  const deleteMutation = useDeleteProject();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const targetId = dialog !== null && dialog.type !== 'create' ? dialog.projectId : null;
  const target = projects?.find((project) => project.id === targetId);

  // The project vanished from the list (deleted elsewhere): nothing left to edit or delete.
  const isTargetMissing = targetId !== null && isSuccess && target === undefined;
  useEffect(() => {
    if (isTargetMissing) close();
  }, [isTargetMissing, close]);

  if (dialog === null) return null;
  if (dialog.type === 'create') return <ProjectFormDialog onClose={close} />;
  if (target === undefined) return null;
  if (dialog.type === 'edit') return <ProjectFormDialog key={target.id} project={target} onClose={close} />;

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(target.id);
      // Leave the deleted project first; its caches are removed after the navigation commits.
      if (currentProjectId === target.id) navigate(paths.projects);
      close();
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : t('common:errors.generic'));
    }
  };

  const handleCancel = () => {
    setDeleteError(null);
    close();
  };

  return (
    <ConfirmDialog
      open
      title={t('projects:delete.title')}
      confirmLabel={t('projects:delete.confirm')}
      isDestructive
      isPending={deleteMutation.isPending}
      errorMessage={deleteError}
      onConfirm={() => void handleDelete()}
      onCancel={handleCancel}
    >
      <Typography>
        <Trans i18nKey="projects:delete.body" values={{ name: target.name }} components={{ strong: <strong dir="auto" /> }} />
      </Typography>
    </ConfirmDialog>
  );
}
