import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '@/features/todos/api/todos';
import { todoKeys, todoMutationKeys } from '@/features/todos/api/keys';
import {
  invalidateTodoCounters,
  replaceTodoInListCaches,
  restoreTodoListCaches,
} from '@/features/todos/utils/todoCache';
import type { TodoListSnapshot } from '@/features/todos/utils/todoCache';
import { patchTodoInBoardCaches } from '@/features/todos/utils/boardCache';
import { boardKeys } from '@/features/board/api/keys';
import { sprintKeys } from '@/features/sprints/api/keys';
import { t } from '@/shared/i18n';
import { showToast } from '@/shared/stores/toastStore';
import type { Todo, UpdateTodoRequest } from '@/shared/types/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

export type UpdateTodoVariables = {
  todoId: string;
  changes: UpdateTodoRequest;
  previous: Pick<Todo, 'projectId' | 'sprintId'>;
  successMessage?: string;
  /** The inverse change. When set, the success toast shows "Undo" (status change, move to sprint). */
  undoChanges?: UpdateTodoRequest;
  /** Apply the change to the caches before the server answers (inline editing). Not for sprint moves. */
  isOptimistic?: boolean;
  /** No success toast (inline edits are visible at once). */
  isSilent?: boolean;
};

type UpdateContext = { snapshot: TodoListSnapshot | null };

function findTodo(snapshot: TodoListSnapshot, todoId: string): Todo | undefined {
  for (const [, data] of snapshot) {
    const found = data?.find((todo) => todo.id === todoId);
    if (found) return found;
  }
  return undefined;
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  const refreshSprints = (todo: Todo, previous: Pick<Todo, 'projectId' | 'sprintId'>) => {
    void queryClient.invalidateQueries({ queryKey: sprintKeys.all(todo.projectId) });
    for (const sprintId of new Set([previous.sprintId, todo.sprintId])) {
      if (sprintId === null) continue;
      void queryClient.invalidateQueries({ queryKey: boardKeys.detail(sprintId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.detail(sprintId) });
    }
  };

  return useMutation<Todo, unknown, UpdateTodoVariables, UpdateContext>({
    mutationKey: todoMutationKeys.update,
    mutationFn: ({ todoId, changes }) => updateTodo({ todoId, changes }),
    onMutate: async ({ todoId, changes, previous, isOptimistic }) => {
      if (isOptimistic !== true || 'sprintId' in changes) return { snapshot: null };
      await queryClient.cancelQueries({ queryKey: todoKeys.all(previous.projectId) });
      const snapshot = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all(previous.projectId) });
      const current = queryClient.getQueryData<Todo>(todoKeys.detail(todoId)) ?? findTodo(snapshot, todoId);
      if (current !== undefined) {
        const patched: Todo = { ...current, ...changes } as Todo;
        replaceTodoInListCaches(queryClient, patched);
        patchTodoInBoardCaches(queryClient, patched);
      }
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      if (context?.snapshot) restoreTodoListCaches(queryClient, context.snapshot);
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
      // Inline edits show validation errors next to the field; the caller handles `onError` too.
      showToast(getErrorMessage(error), 'error');
    },
    onSuccess: (todo, { previous, successMessage, undoChanges, isSilent }) => {
      queryClient.setQueryData(todoKeys.detail(todo.id), todo);
      replaceTodoInListCaches(queryClient, todo);
      invalidateTodoCounters(queryClient, todo.projectId);
      refreshSprints(todo, previous);
      if (isSilent === true) return;
      const message = successMessage ?? t('todos:toast.saved');
      if (undoChanges === undefined) {
        showToast(message);
        return;
      }
      showToast(message, 'success', {
        action: {
          label: t('common:undo.label'),
          onClick: () => {
            updateTodo({ todoId: todo.id, changes: undoChanges })
              .then((restored) => {
                queryClient.setQueryData(todoKeys.detail(restored.id), restored);
                replaceTodoInListCaches(queryClient, restored);
                invalidateTodoCounters(queryClient, restored.projectId);
                refreshSprints(restored, { projectId: todo.projectId, sprintId: todo.sprintId });
                showToast(t('common:undo.undone'), 'info');
              })
              .catch(() => showToast(t('common:undo.failed'), 'error'));
          },
        },
      });
    },
  });
}
