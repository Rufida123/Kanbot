import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { todoKeys, todoMutationKeys } from '@/features/todos/api/keys';
import { TodoDeleteConfirm } from '@/features/todos/components/TodoDeleteConfirm';
import { useTodoDialogParam } from '@/features/todos/hooks/useTodoDialogParam';
import { useTodoDeleteStore } from '@/features/todos/store/todoDeleteStore';

// Loaded the first time a todo is opened, so the form code is not part of the shell bundle.
const TodoDetailsDialog = lazy(() =>
  import('@/features/todos/components/todo-details-dialog').then((module) => ({
    default: module.TodoDetailsDialog,
  })),
);

function getDeletedTodoId(variables: unknown): string | null {
  if (typeof variables !== 'object' || variables === null || !('id' in variables)) return null;
  return typeof variables.id === 'string' ? variables.id : null;
}

/**
 * Mounted once in the app shell. Shows the details dialog while the URL has `?todo=<id>`
 * (so a row click, a pasted link and a reload all work) and the delete confirmation.
 */
export function TodoDetailsHost() {
  const { todoId, closeTodo } = useTodoDialogParam();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const queryClient = useQueryClient();
  const clearDeleteRequest = useTodoDeleteStore((state) => state.clear);

  // A pending confirmation must not survive this host (logout): the next user would see it.
  useEffect(() => clearDeleteRequest, [clearDeleteRequest]);

  // Removes the cache of deleted todos once the dialog no longer shows them. `removeQueries`,
  // not `invalidateQueries`: refetching a deleted todo would only produce a 404.
  const deletedIds = useMutationState({
    filters: { mutationKey: todoMutationKeys.delete, status: 'success' },
    select: (mutation) => getDeletedTodoId(mutation.state.variables),
  });
  useEffect(() => {
    for (const deletedId of deletedIds) {
      if (deletedId === null || deletedId === todoId) continue;
      queryClient.removeQueries({ queryKey: todoKeys.detail(deletedId) });
    }
  }, [deletedIds, todoId, queryClient]);

  return (
    <>
      {todoId !== null && projectId !== undefined ? (
        <Suspense fallback={null}>
          <TodoDetailsDialog key={todoId} todoId={todoId} projectId={projectId} onClose={closeTodo} />
        </Suspense>
      ) : null}
      <TodoDeleteConfirm />
    </>
  );
}
