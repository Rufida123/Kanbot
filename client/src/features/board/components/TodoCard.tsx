import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTranslation } from 'react-i18next';
import { useBoardLabelFilter } from '@/features/board/context/BoardFilterContext';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { useInlineTodoEdit } from '@/features/todos/hooks/useInlineTodoEdit';
import { DueBadge } from '@/shared/components/DueBadge';
import { useDensityScale } from '@/shared/components/DensityToggle';
import { InlinePoints, InlinePriority, InlineText } from '@/shared/components/InlineEdit';
import { LabelChips } from '@/shared/components/LabelChips';
import { useState } from 'react';
import { TodoActionsMenu } from '@/features/todos/components/TodoActionsMenu';
import type { TodoMenuAction } from '@/features/todos/components/TodoActionsMenu';
import { PointsChip } from '@/shared/components/PointsChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TypeIcon } from '@/shared/components/TypeIcon';
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { Todo } from '@/shared/types/api';

const TITLE_SX = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
  overflowWrap: 'anywhere',
  fontWeight: 'fontWeightMedium',
} as const;

type TodoCardProps = {
  todo: Todo;
  onOpen: (todoId: string) => void;
  /** The "Move to …" entries of the ⋮ menu (the non-drag way to change the status). */
  menuActions: readonly TodoMenuAction[];
  /** The drag handle of a sortable card; the overlay copy has none. */
  dragHandle?: ReactNode;
  /** Sortable cards: the `li` ref and the transform style from dnd-kit. */
  rootRef?: Ref<HTMLLIElement>;
  rootStyle?: CSSProperties;
  /** The card being dragged stays in its column as a faded placeholder. */
  isDragging?: boolean;
  /** The floating copy under the pointer: no menu, a shadow. */
  isOverlay?: boolean;
};

/**
 * One card of the board. Same badges as the backlog rows. It is an `li` with sibling buttons
 * (drag handle, open button, ⋮ menu): a button never contains another button, and only the
 * handle starts a drag, so click, text selection and touch scrolling keep working.
 */
export function TodoCard({
  todo,
  onOpen,
  menuActions,
  dragHandle,
  rootRef,
  rootStyle,
  isDragging = false,
  isOverlay = false,
}: TodoCardProps) {
  const { t } = useTranslation();
  const density = useDensityScale();
  const labelFilter = useBoardLabelFilter();
  const edit = useInlineTodoEdit(todo);
  const [renameSignal, setRenameSignal] = useState(0);
  const isReadOnly = isOverlay;
  const isDimmed = labelFilter !== null && !todo.labels.includes(labelFilter);
  const actions: readonly TodoMenuAction[] = [
    { id: 'rename', label: t('todos:inline.rename'), disabledReason: null, onSelect: () => setRenameSignal((n) => n + 1) },
    ...menuActions,
  ];
  return (
    <Box
      component="li"
      ref={rootRef}
      style={rootStyle}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        opacity: isDragging ? 0.4 : isDimmed ? 0.35 : 1,
        boxShadow: isOverlay ? 8 : 0,
        // A small lift while dragging; the base `transition` is switched off by reduced motion in the theme.
        transform: isOverlay ? 'scale(1.03)' : 'none',
        transition: (theme) => theme.transitions.create(['opacity', 'box-shadow', 'transform']),
        listStyle: 'none',
      }}
    >
      {dragHandle}
      <ButtonBase
        type="button"
        onClick={() => onOpen(todo.id)}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1,
          padding: 1.25 * density,
          paddingInlineStart: dragHandle === undefined ? 1.25 : 0.5,
          textAlign: 'start',
          borderRadius: 1,
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TypeIcon type={todo.type} />
          <Box
            component="span"
            sx={{ color: 'text.secondary', fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums' }}
          >
            {todo.key}
          </Box>
        </Box>
        <InlineText value={todo.title} maxLength={TODO_LIMITS.titleMax} onCommit={edit.saveTitle} ariaLabel={t('todos:form.title')} isDisabled={isReadOnly} startSignal={renameSignal}>
          <Box component="span" dir="auto" title={todo.title} sx={TITLE_SX}>
            {todo.title}
          </Box>
        </InlineText>
        <LabelChips labels={todo.labels} projectId={todo.projectId} />
        <DueBadge dueDate={todo.dueDate} isDone={todo.status === 'done'} />
      </ButtonBase>
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', paddingInline: 1.25, paddingBlockEnd: 1.25 * density, width: '100%', order: 3 }}>
        <InlinePriority value={todo.priority} onChange={edit.savePriority} isDisabled={isReadOnly} ariaLabel={t('todos:inline.changePriority', { key: todo.key })}>
          <PriorityBadge priority={todo.priority} />
        </InlinePriority>
        <InlinePoints value={todo.storyPoints} onChange={edit.savePoints} isDisabled={isReadOnly} ariaLabel={t('todos:inline.changePoints', { key: todo.key })} notEstimatedLabel={t('common:points.notEstimated')}>
          <PointsChip points={todo.storyPoints} />
        </InlinePoints>
      </Box>
      {isOverlay ? null : (
        <Box sx={{ display: 'flex', paddingBlockStart: 0.5, paddingInlineEnd: 0.5 }}>
          <TodoActionsMenu todo={todo} onOpen={onOpen} extraActions={actions} />
        </Box>
      )}
    </Box>
  );
}
