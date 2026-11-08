import { lazy, Suspense } from 'react';
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { useTodoDialogParam } from '@/features/todos/hooks/useTodoDialogParam';

const TodoDetailsDialog = lazy(() =>
  import('@/features/todos/components/todo-details-dialog').then((module) => ({
    default: module.TodoDetailsDialog,
  })),
);

/**
 * Mounted once in the shell. Opens the details dialog from `?todo=<id>` (deep links work).
 * Deleting no longer asks for confirmation: it is a soft delete with an Undo toast.
 */
export function TodoDetailsHost() {
  const { todoId, closeTodo } = useTodoDialogParam();
  const projectId = useParams()[PROJECT_ID_PARAM];
  if (todoId === null || projectId === undefined) return null;
  return (
    <Suspense fallback={null}>
      <TodoDetailsDialog key={todoId} todoId={todoId} projectId={projectId} onClose={closeTodo} />
    </Suspense>
  );
}
