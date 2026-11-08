import { useMoveTodo } from '@/features/todos';
import type { TodoMenuAction } from '@/features/todos';
import { BOARD_STATUSES } from '@/features/board/config/layout';
import type { BoardColumns } from '@/features/board/utils/progress';
import { STATUS_LABELS } from '@/shared/config/constants';
import { t } from '@/shared/i18n';
import type { Todo } from '@/shared/types/api';

/**
 * The card menu's "Move to <status>" entries: the keyboard and touch alternative to dragging.
 * A move appends the card to the target column (`position` = its length), through the same
 * optimistic `useMoveTodo` as a drop, so the progress bar and the counts update at once.
 */
export function useBoardMoveActions(projectId: string, columns: BoardColumns) {
  const moveMutation = useMoveTodo(projectId);

  return (todo: Todo): TodoMenuAction[] =>
    BOARD_STATUSES.filter((status) => status !== todo.status).map((status) => ({
      id: `move-to-${status}`,
      label: t('board:move.to', { status: STATUS_LABELS[status] }),
      disabledReason: null,
      onSelect: () =>
        moveMutation.mutate({
          todo,
          sprintId: todo.sprintId,
          status,
          position: columns[status].length,
          successMessage: t('board:move.moved', { key: todo.key, status: STATUS_LABELS[status] }),
          // "Undo" puts the card back in its old column and place.
          undo: { status: todo.status, position: Math.max(columns[todo.status].findIndex((item) => item.id === todo.id), 0) },
        }),
    }));
}
