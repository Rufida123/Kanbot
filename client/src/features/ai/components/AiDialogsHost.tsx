import { useEffect } from 'react';
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { GenerateTodosDialog } from '@/features/ai/components/generate-todos-dialog';
import { PlanSprintDialog } from '@/features/ai/components/plan-sprint-dialog';
import { useAiDialogStore } from '@/features/ai/store/aiDialogStore';

/**
 * Renders the open AI dialog. Mounted once in the app shell, so the drawer's quick actions and the
 * empty backlog open the same dialogs through `aiDialogStore`. The `key` gives every project fresh
 * dialog state; leaving the project pages closes the dialog.
 */
export function AiDialogsHost() {
  const dialog = useAiDialogStore((state) => state.dialog);
  const close = useAiDialogStore((state) => state.close);
  const projectId = useParams()[PROJECT_ID_PARAM];

  useEffect(() => {
    if (dialog !== null && projectId === undefined) close();
  }, [dialog, projectId, close]);

  if (dialog === null || projectId === undefined) return null;
  if (dialog === 'generate-todos') {
    return <GenerateTodosDialog key={projectId} projectId={projectId} onClose={close} />;
  }
  return <PlanSprintDialog key={projectId} projectId={projectId} onClose={close} />;
}
