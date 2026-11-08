import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { SortableTodoCard } from '@/features/board/components/SortableTodoCard';
import { useBoardPreview, usePreviewedColumn } from '@/features/board/context/BoardPreviewContext';
import {
  BOARD_COLUMN_BODY_MAX_HEIGHT,
  BOARD_COLUMN_BODY_MIN_HEIGHT_REM,
  BOARD_COLUMN_MIN_WIDTH_REM,
} from '@/features/board/config/layout';
import { toColumnId } from '@/features/board/utils/boardContainers';
import { getColumnPoints } from '@/features/board/utils/progress';
import { STATUS_LABELS } from '@/shared/config/constants';
import type { TodoMenuAction } from '@/features/todos';
import type { Todo, TodoStatus } from '@/shared/types/api';
import { formatCount } from '@/shared/utils/formatCount';

type BoardColumnProps = {
  status: TodoStatus;
  todos: readonly Todo[];
  getMenuActions: (todo: Todo) => readonly TodoMenuAction[];
  onOpen: (todoId: string) => void;
};

/**
 * One status column: a header (name, count, points) that never scrolls and a bounded card list
 * that does. The whole body is the droppable area, so an empty column accepts drops too.
 */
export function BoardColumn({ status, todos, getMenuActions, onOpen }: BoardColumnProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const columnId = toColumnId(status);
  const { isDragging } = useBoardPreview();
  const shownTodos = usePreviewedColumn(status, todos);
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <Box
      component="section"
      aria-labelledby={headingId}
      sx={{
        // Phones: one column almost fills the screen and snaps into place (swipe).
        flex: { xs: '0 0 85%', md: `1 0 ${BOARD_COLUMN_MIN_WIDTH_REM}rem` },
        scrollSnapAlign: 'start',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        padding: 1,
        borderRadius: 2,
        backgroundColor: 'action.hover',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, paddingInline: 0.5 }} data-column-status={status}>
        <Typography id={headingId} component="h2" variant="subtitle2" sx={{ color: `status.${status}` }}>
          {STATUS_LABELS[status]}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {t('board:column.points', { todos: formatCount(todos.length, 'todo'), points: formatCount(getColumnPoints(todos), 'point') })}
        </Typography>
      </Box>
      <Box
        ref={setNodeRef}
        sx={{
          minHeight: `${BOARD_COLUMN_BODY_MIN_HEIGHT_REM}rem`,
          maxHeight: BOARD_COLUMN_BODY_MAX_HEIGHT,
          overflow: 'auto',
          borderRadius: 1,
          outline: isOver ? '2px dashed' : 'none',
          outlineColor: 'primary.main',
          outlineOffset: '-2px',
        }}
      >
        <SortableContext items={shownTodos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
          <Box
            component="ul"
            aria-label={t('board:column.todosAria', { status: STATUS_LABELS[status] })}
            sx={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1, minHeight: '3rem' }}
          >
            {shownTodos.map((todo) => (
              <SortableTodoCard
                key={todo.id}
                todo={todo}
                columnId={columnId}
                menuActions={getMenuActions(todo)}
                onOpen={onOpen}
              />
            ))}
          </Box>
        </SortableContext>
        {shownTodos.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ padding: 1.5, textAlign: 'center' }}>
            {isDragging ? t('common:misc.dropHere') : t('common:misc.noTodos')}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
