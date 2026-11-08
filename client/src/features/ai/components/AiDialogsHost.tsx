import { useEffect } from 'react';
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { EstimateDialog } from '@/features/ai/components/EstimateDialog';
import { ImproveTodoDialog } from '@/features/ai/components/ImproveTodoDialog';
import { StandupDialog } from '@/features/ai/components/StandupDialog';
import { GenerateTodosDialog } from '@/features/ai/components/generate-todos-dialog';
import { PlanSprintDialog } from '@/features/ai/components/plan-sprint-dialog';
import { useAiDialogStore } from '@/features/ai/store/aiDialogStore';

/** Mounted once in the shell: opens whichever AI dialog the store asks for, for the current project. */
export function AiDialogsHost() {
  const dialog = useAiDialogStore((state) => state.dialog);
  const todoId = useAiDialogStore((state) => state.todoId);
  const close = useAiDialogStore((state) => state.close);
  const projectId = useParams()[PROJECT_ID_PARAM];

  // Leaving the project (for example to /projects) closes the dialog.
  useEffect(() => {
    if (dialog !== null && projectId === undefined) close();
  }, [dialog, projectId, close]);

  if (dialog === null || projectId === undefined) return null;
  if (dialog === 'generate-todos') return <GenerateTodosDialog key={projectId} projectId={projectId} onClose={close} />;
  if (dialog === 'improve-todo' && todoId !== null) return <ImproveTodoDialog key={todoId} todoId={todoId} onClose={close} />;
  if (dialog === 'estimate') return <EstimateDialog key={projectId} projectId={projectId} onClose={close} />;
  if (dialog === 'standup') return <StandupDialog key={projectId} projectId={projectId} onClose={close} />;
  return <PlanSprintDialog key={projectId} projectId={projectId} onClose={close} />;
}
