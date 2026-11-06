import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveTodo } from '@/features/todos/api/todos';
import { todoKeys, todoMutationKeys } from '@/features/todos/api/keys';
import {
  applyMoveToListCaches,
  invalidateTodoCounters,
  restoreTodoListCaches,
} from '@/features/todos/utils/todoCache';
import type { TodoListSnapshot, TodoMove } from '@/features/todos/utils/todoCache';
import { boardKeys } from '@/features/board/api/keys';
import { sprintKeys } from '@/features/sprints/api/keys';
import { showToast } from '@/shared/stores/toastStore';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { MoveTodoRequest, Todo } from '@/shared/types/api';

export type MoveTodoVariables = TodoMove & {
  /** Toast text on success, for example "KAN-12 moved to Sprint 2". */
  successMessage: string;
};

type MoveContext = { snapshot: TodoListSnapshot };

/** Only what changes goes into the body: `position` always, the sprint and status when they differ. */
export function buildMoveRequest(move: TodoMove): MoveTodoRequest {
  return {
    position: move.position,
    ...(move.sprintId !== move.todo.sprintId && { sprintId: move.sprintId }),
    ...(move.status !== undefined && move.status !== move.todo.status && { status: move.status }),
  };
}

/**
 * Optimistic move (drag, Move to top / bottom). The cached lists change at once; a failure
 * restores them and shows the server's message. The `scope` makes the requests of one project
 * run one after another in the order they were made (a queued move has already updated the
 * cache, its request just waits). Invalidation happens once, after the last pending move.
 */
export function useMoveTodo(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Todo, unknown, MoveTodoVariables, MoveContext>({
    mutationKey: todoMutationKeys.move,
    scope: { id: `move-todo-${projectId}` },
    mutationFn: (move) => moveTodo({ todoId: move.todo.id, request: buildMoveRequest(move) }),
    onMutate: async (move) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.all(projectId) });
      const snapshot = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all(projectId) });
      applyMoveToListCaches(queryClient, snapshot, move);
      return { snapshot };
    },
    onError: (error, _move, context) => {
      if (context !== undefined) restoreTodoListCaches(queryClient, context.snapshot);
      showToast(getErrorMessage(error), 'error');
    },
    onSuccess: (todo, { successMessage }) => {
      queryClient.setQueryData(todoKeys.detail(todo.id), todo);
      showToast(successMessage);
    },
    onSettled: (_data, _error, { todo, sprintId }) => {
      if (queryClient.isMutating({ mutationKey: todoMutationKeys.move }) !== 1) return;
      invalidateTodoCounters(queryClient, projectId);
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
      for (const sprintIdToRefresh of new Set([todo.sprintId, sprintId])) {
        if (sprintIdToRefresh === null) continue;
        void queryClient.invalidateQueries({ queryKey: boardKeys.detail(sprintIdToRefresh) });
      }
    },
  });
}
