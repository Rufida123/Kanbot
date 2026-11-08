import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { boardKeys } from '@/features/board/api/keys';
import { sprintKeys } from '@/features/sprints/api/keys';
import { todoKeys } from '@/features/todos/api/keys';
import { updateTodo } from '@/features/todos/api/todos';
import { invalidateTodoCounters, replaceTodoInListCaches } from '@/features/todos/utils/todoCache';
import { t } from '@/shared/i18n';
import { showToast } from '@/shared/stores/toastStore';
import type { Todo, UpdateTodoRequest } from '@/shared/types/api';

export type BulkProgress = { done: number; total: number } | null;
export type BulkResult = { succeeded: Todo[]; failed: Todo[] };

/**
 * Bulk update without a bulk endpoint: a client-side loop (one PATCH per todo, one at a time)
 * with progress, a partial-failure report and Undo for the todos that did change (enhancement 10).
 */
export function useBulkUpdate(projectId: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BulkProgress>(null);

  const refresh = () => {
    invalidateTodoCounters(queryClient, projectId);
    void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) });
    void queryClient.invalidateQueries({ queryKey: boardKeys.all });
  };

  const apply = async (todos: readonly Todo[], changesFor: (todo: Todo) => UpdateTodoRequest, onStep?: (done: number) => void) => {
    const succeeded: Todo[] = [];
    const failed: Todo[] = [];
    for (const todo of todos) {
      try {
        const updated = await updateTodo({ todoId: todo.id, changes: changesFor(todo) });
        queryClient.setQueryData(todoKeys.detail(updated.id), updated);
        replaceTodoInListCaches(queryClient, updated);
        succeeded.push(todo);
      } catch {
        failed.push(todo);
      }
      onStep?.(succeeded.length + failed.length);
    }
    return { succeeded, failed };
  };

  const run = async (
    todos: readonly Todo[],
    changesFor: (todo: Todo) => UpdateTodoRequest,
    undoFor: (todo: Todo) => UpdateTodoRequest,
  ): Promise<BulkResult> => {
    setProgress({ done: 0, total: todos.length });
    const result = await apply(todos, changesFor, (done) => setProgress({ done, total: todos.length }));
    setProgress(null);
    refresh();
    const message =
      result.failed.length === 0
        ? t('todos:bulk.updated', { count: result.succeeded.length })
        : `${t('todos:bulk.partial', { done: result.succeeded.length, failed: result.failed.length })}. ${t('todos:bulk.partialDetail', { keys: result.failed.map((todo) => todo.key).join(', ') })}`;
    showToast(message, result.failed.length === 0 ? 'success' : 'warning', {
      durationMs: 8_000,
      action:
        result.succeeded.length === 0
          ? undefined
          : {
              label: t('common:undo.label'),
              onClick: () => {
                void apply(result.succeeded, undoFor).then((undone) => {
                  refresh();
                  showToast(undone.failed.length === 0 ? t('common:undo.undone') : t('common:undo.failed'), undone.failed.length === 0 ? 'info' : 'error');
                });
              },
            },
    });
    return result;
  };

  return { run, progress, isRunning: progress !== null };
}
