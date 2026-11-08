import { getListLength, useMoveTodo, useUpdateTodo } from '@/features/todos';
import type { TodoMenuAction } from '@/features/todos';
import { buildMoveEntries } from '@/features/backlog/utils/buildMoveEntries';
import type { MoveEntry } from '@/features/backlog/utils/buildMoveEntries';
import { t } from '@/shared/i18n';
import { showToast } from '@/shared/stores/toastStore';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { Sprint, Todo } from '@/shared/types/api';

type UseTodoMoveActionsParams = {
  projectId: string;
  sprints: readonly Sprint[] | undefined;
  /** The whole backlog, in order. `null` while a filter narrows it or its data is not final. */
  fullBacklog: readonly Todo[] | null;
  /** Planned sprint lists by sprint id. */
  sprintTodos: ReadonlyMap<string, readonly Todo[]>;
};

/**
 * The row menu's move actions (BL-5, BL-7). Top and bottom use the optimistic move with a
 * `position`; moving to another sprint or the backlog uses the Sprint 3 update (the server
 * appends the todo at the end of the target list).
 */
export function useTodoMoveActions({ projectId, sprints, fullBacklog, sprintTodos }: UseTodoMoveActionsParams) {
  const moveMutation = useMoveTodo(projectId);
  const updateMutation = useUpdateTodo();

  const runEntry = (todo: Todo, entry: MoveEntry, ownList: readonly Todo[] | undefined) => {
    const { target } = entry;
    if (target.kind === 'top' || target.kind === 'bottom') {
      const isGrouped = todo.sprintId !== null;
      const position =
        target.kind === 'top' ? 0 : getListLength(ownList ?? [], todo.status, isGrouped) - 1;
      moveMutation.mutate({
        todo,
        sprintId: todo.sprintId,
        status: undefined,
        position,
        undo: { position: Math.max((ownList ?? []).findIndex((item) => item.id === todo.id), 0) },
        successMessage: t(target.kind === 'top' ? 'todos:move.movedTop' : 'todos:move.movedBottom', { key: todo.key }),
      });
      return;
    }
    const sprintId = target.kind === 'sprint' ? target.sprint.id : null;
    const destination = target.kind === 'sprint' ? target.sprint.name : t('todos:move.theBacklog');
    updateMutation.mutate(
      {
        todoId: todo.id,
        changes: { sprintId },
        previous: { projectId: todo.projectId, sprintId: todo.sprintId },
        successMessage: t('todos:move.movedTo', { key: todo.key, destination }),
        // "Undo" on the toast moves it back to where it was (enhancement 4).
        undoChanges: { sprintId: todo.sprintId },
      },
      { onError: (error) => showToast(getErrorMessage(error), 'error') },
    );
  };

  return (todo: Todo): TodoMenuAction[] => {
    const isInBacklog = todo.sprintId === null;
    const ownList = isInBacklog ? (fullBacklog ?? undefined) : sprintTodos.get(todo.sprintId ?? '');
    const entries = buildMoveEntries({
      todo,
      ownList,
      isOwnListFiltered: isInBacklog && fullBacklog === null,
      sprints,
    });
    return entries.map((entry) => ({
      id: entry.id,
      label: entry.label,
      disabledReason: entry.disabledReason,
      onSelect: () => runEntry(todo, entry, ownList),
    }));
  };
}
