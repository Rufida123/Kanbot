import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '@/features/todos/api/todos';
import { todoKeys, todoMutationKeys } from '@/features/todos/api/keys';
import {
  invalidateTodoCounters,
  replaceTodoInListCaches,
} from '@/features/todos/utils/todoCache';
import { boardKeys } from '@/features/board/api/keys';
import { sprintKeys } from '@/features/sprints/api/keys';
import { showToast } from '@/shared/stores/toastStore';
import type { Todo, UpdateTodoRequest } from '@/shared/types/api';

export type UpdateTodoVariables = {
  todoId: string;
  /** Only the changed fields (see `getTodoChanges`). */
  changes: UpdateTodoRequest;
  /** The todo as it was loaded: tells which board and sprint the todo is leaving. */
  previous: Pick<Todo, 'projectId' | 'sprintId'>;
  /** Toast text on success. Defaults to "Todo saved"; the row menu passes "Moved …". */
  successMessage?: string;
};

/** True when the edit can change sprint numbers or a board (sprint, status or points). */
function affectsSprints(changes: UpdateTodoRequest): boolean {
  return 'sprintId' in changes || 'status' in changes || 'storyPoints' in changes;
}

/**
 * Saves the changed fields. Updates the detail cache with the returned todo (no refetch of
 * `['todo', id]` needed) and the cached lists, then refreshes counters, sprints and boards.
 * The dialog shows errors itself, so there is no error toast here.
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: todoMutationKeys.update,
    mutationFn: ({ todoId, changes }: UpdateTodoVariables) => updateTodo({ todoId, changes }),
    onSuccess: (todo, { changes, previous, successMessage }) => {
      queryClient.setQueryData(todoKeys.detail(todo.id), todo);
      replaceTodoInListCaches(queryClient, todo);
      invalidateTodoCounters(queryClient, todo.projectId);
      if (affectsSprints(changes)) {
        void queryClient.invalidateQueries({ queryKey: sprintKeys.all(todo.projectId) });
        for (const sprintId of new Set([previous.sprintId, todo.sprintId])) {
          if (sprintId === null) continue;
          void queryClient.invalidateQueries({ queryKey: boardKeys.detail(sprintId) });
        }
      }
      showToast(successMessage ?? 'Todo saved');
    },
  });
}
