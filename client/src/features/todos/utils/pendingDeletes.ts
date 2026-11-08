import { boardKeys } from '@/features/board/api/keys';
import { deleteTodo } from '@/features/todos/api/todos';
import { todoKeys } from '@/features/todos/api/keys';
import { getBoardSnapshot, removeTodosFromBoardCaches, restoreBoardCaches } from '@/features/todos/utils/boardCache';
import type { BoardSnapshot } from '@/features/todos/utils/boardCache';
import { invalidateTodoCounters, removeTodoFromListCaches, restoreTodoListCaches } from '@/features/todos/utils/todoCache';
import type { TodoListSnapshot } from '@/features/todos/utils/todoCache';
import { sprintKeys } from '@/features/sprints/api/keys';
import { ApiError } from '@/shared/api/client';
import { t } from '@/shared/i18n';
import { queryClient } from '@/shared/lib/queryClient';
import { showToast, useToastStore } from '@/shared/stores/toastStore';
import type { Todo } from '@/shared/types/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

/** How long a delete can be undone (matches the toast, `UNDO_TOAST_MS`). */
export const UNDO_WINDOW_MS = 6_000;

export type DeleteTarget = Pick<Todo, 'id' | 'projectId' | 'key' | 'title'>;

type PendingDelete = {
  targets: readonly DeleteTarget[];
  listSnapshot: TodoListSnapshot;
  boardSnapshot: BoardSnapshot;
  timer: ReturnType<typeof setTimeout>;
  toastId: string;
};

const pending = new Map<string, PendingDelete>();
let sequence = 0;

async function commit(entry: PendingDelete): Promise<void> {
  const failed: DeleteTarget[] = [];
  await Promise.all(
    entry.targets.map(async (target) => {
      try {
        await deleteTodo(target.id);
      } catch (error) {
        // Already gone on the server counts as deleted.
        if (!(error instanceof ApiError && error.status === 404)) failed.push(target);
        if (!(error instanceof ApiError && error.status === 404)) showToast(getErrorMessage(error), 'error');
      }
    }),
  );
  const projectId = entry.targets[0]?.projectId;
  if (failed.length > 0) {
    restoreTodoListCaches(queryClient, entry.listSnapshot);
    restoreBoardCaches(queryClient, entry.boardSnapshot);
  }
  for (const target of entry.targets) queryClient.removeQueries({ queryKey: todoKeys.detail(target.id) });
  if (projectId !== undefined) {
    invalidateTodoCounters(queryClient, projectId);
    void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
    void queryClient.invalidateQueries({ queryKey: boardKeys.all });
  }
}

/**
 * Soft delete (enhancement 4): the todos disappear from every cache at once, the real DELETE is
 * sent when the "Undo" toast expires and is cancelled by Undo. `flushPendingDeletes` sends it early
 * (route change, tab close).
 */
export function softDeleteTodos(targets: readonly DeleteTarget[]): void {
  const first = targets[0];
  if (first === undefined) return;
  const ids = new Set(targets.map((target) => target.id));
  const { projectId } = first;
  void queryClient.cancelQueries({ queryKey: todoKeys.all(projectId) });
  const listSnapshot = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all(projectId) });
  const boardSnapshot = getBoardSnapshot(queryClient, projectId);
  for (const id of ids) removeTodoFromListCaches(queryClient, projectId, id);
  removeTodosFromBoardCaches(queryClient, projectId, ids);

  const key = `delete-${(sequence += 1)}`;
  const message =
    targets.length === 1
      ? t('todos:delete.deleted', { key: first.key })
      : t('todos:delete.deletedMany', { count: targets.length });
  const toastId = showToast(message, 'success', {
    durationMs: UNDO_WINDOW_MS,
    action: { label: t('common:undo.label'), onClick: () => undoDelete(key) },
  });
  const entry: PendingDelete = {
    targets,
    listSnapshot,
    boardSnapshot,
    toastId,
    timer: setTimeout(() => {
      pending.delete(key);
      void commit(entry);
    }, UNDO_WINDOW_MS),
  };
  pending.set(key, entry);
}

export function undoDelete(key: string): void {
  const entry = pending.get(key);
  if (entry === undefined) return;
  clearTimeout(entry.timer);
  pending.delete(key);
  restoreTodoListCaches(queryClient, entry.listSnapshot);
  restoreBoardCaches(queryClient, entry.boardSnapshot);
}

export function getPendingDeleteCount(): number {
  return pending.size;
}

/** Sends every waiting delete now (route change) and closes its toast. */
export function flushPendingDeletes(): void {
  for (const [key, entry] of [...pending]) {
    clearTimeout(entry.timer);
    pending.delete(key);
    useToastStore.getState().dismiss(entry.toastId);
    void commit(entry);
  }
}

/** Tab close: `keepalive` lets the DELETE finish after the page is gone. */
export function flushPendingDeletesOnUnload(sendKeepalive: (todoId: string) => void): void {
  for (const [key, entry] of [...pending]) {
    clearTimeout(entry.timer);
    pending.delete(key);
    for (const target of entry.targets) sendKeepalive(target.id);
  }
}
