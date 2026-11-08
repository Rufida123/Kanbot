import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import { useTranslation } from 'react-i18next';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { useInlineTodoEdit } from '@/features/todos/hooks/useInlineTodoEdit';
import { DueBadge } from '@/shared/components/DueBadge';
import { useDensityScale } from '@/shared/components/DensityToggle';
import { InlinePoints, InlinePriority, InlineText } from '@/shared/components/InlineEdit';
import { TodoActionsMenu } from '@/features/todos/components/TodoActionsMenu';
import type { TodoMenuAction } from '@/features/todos/components/TodoActionsMenu';
import { LabelChips } from '@/shared/components/LabelChips';
import { PointsChip } from '@/shared/components/PointsChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TypeIcon } from '@/shared/components/TypeIcon';
import { staggeredEnterSx } from '@/shared/theme/motion';
import { useState } from 'react';
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { Todo } from '@/shared/types/api';

const TITLE_SX = {
  flex: '1 1 14rem',
  minWidth: 0,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  overflowWrap: 'anywhere',
  fontWeight: 'fontWeightMedium',
} as const;

type TodoRowProps = {
  todo: Todo;
  /** Position in the list: the first rows fade in one after the other. */
  index: number;
  onOpen: (todoId: string) => void;
  onDelete: (todo: Todo) => void;
  /** The drag handle of a sortable row (Sprint 4), shown before the row button. */
  dragHandle?: ReactNode;
  /** Extra ⋮ menu entries, for example "Move to top". */
  menuActions?: readonly TodoMenuAction[];
  /** Sortable rows: the `li` ref and the transform style from dnd-kit. */
  rootRef?: Ref<HTMLLIElement>;
  rootStyle?: CSSProperties;
  /** The row being dragged stays in the list as a faded placeholder. */
  isDragging?: boolean;
  /** Rows of a completed sprint: no drag handle and no menu, only the open button. */
  isReadOnly?: boolean;
  /** Sortable rows skip the enter animation: its final `transform` would override the drag transform. */
  hasEnterAnimation?: boolean;
  /** Bulk selection mode (enhancement 10): a checkbox replaces the drag handle. */
  selection?: { isSelected: boolean; onToggle: (todoId: string) => void } | undefined;
};

/**
 * One backlog row. The whole row is a real button that opens the details; the ⋮ menu is its
 * sibling (a button must not be nested in a button). Inside the button only phrasing content
 * (`span`s) is used, which is why the badges are not MUI chips.
 */
export function TodoRow({
  todo,
  index,
  onOpen,
  onDelete,
  dragHandle,
  menuActions,
  rootRef,
  rootStyle,
  isDragging = false,
  isReadOnly = false,
  hasEnterAnimation = true,
  selection,
}: TodoRowProps) {
  const { t } = useTranslation();
  const density = useDensityScale();
  const edit = useInlineTodoEdit(todo);
  const [renameSignal, setRenameSignal] = useState(0);
  const actions: readonly TodoMenuAction[] = [
    ...(isReadOnly ? [] : [{ id: 'rename', label: t('todos:inline.rename'), disabledReason: null, onSelect: () => setRenameSignal((n) => n + 1) }]),
    ...(menuActions ?? []),
  ];
  const rowHandle = isReadOnly ? undefined : dragHandle;
  return (
    <Box
      component="li"
      ref={rootRef}
      style={rootStyle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderTop: 1,
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 0 },
        ...(hasEnterAnimation && staggeredEnterSx(index)),
        opacity: isDragging ? 0.4 : 1,
        flexWrap: 'wrap',
        backgroundColor: selection?.isSelected ? 'action.selected' : 'background.paper',
        transition: (theme) => theme.transitions.create('background-color'),
      }}
    >
      {selection ? (
        <Checkbox
          checked={selection.isSelected}
          onChange={() => selection.onToggle(todo.id)}
          inputProps={{ 'aria-label': t('todos:bulk.selectTodo', { key: todo.key }) }}
          sx={{ marginInlineStart: 0.5 }}
        />
      ) : (
        rowHandle
      )}
      <ButtonBase
        type="button"
        onClick={() => onOpen(todo.id)}
        sx={{
          flex: '1 1 14rem',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          columnGap: 1.5,
          paddingBlock: 1.25 * density,
          paddingInlineStart: rowHandle === undefined ? 2 : 0.5,
          paddingInlineEnd: 1,
          textAlign: 'start',
          transition: (theme) => theme.transitions.create('background-color'),
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <TypeIcon type={todo.type} />
        <Box component="span" sx={{ minWidth: '4.25rem', color: 'text.secondary', fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {todo.key}
        </Box>
        <InlineText
          value={todo.title}
          maxLength={TODO_LIMITS.titleMax}
          onCommit={edit.saveTitle}
          ariaLabel={t('todos:form.title')}
          isDisabled={isReadOnly}
          startSignal={renameSignal}
        >
          <Box component="span" dir="auto" title={todo.title} sx={TITLE_SX}>
            {todo.title}
          </Box>
        </InlineText>
      </ButtonBase>
      <Box
        component="span"
        sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 1.5, rowGap: 0.5, paddingInlineEnd: 1, marginInlineStart: 'auto' }}
      >
        <DueBadge dueDate={todo.dueDate} isDone={todo.status === 'done'} />
        <LabelChips labels={todo.labels} projectId={todo.projectId} />
        <InlinePriority value={todo.priority} onChange={edit.savePriority} isDisabled={isReadOnly} ariaLabel={t('todos:inline.changePriority', { key: todo.key })}>
          <PriorityBadge priority={todo.priority} />
        </InlinePriority>
        <InlinePoints value={todo.storyPoints} onChange={edit.savePoints} isDisabled={isReadOnly} ariaLabel={t('todos:inline.changePoints', { key: todo.key })} notEstimatedLabel={t('common:points.notEstimated')}>
          <PointsChip points={todo.storyPoints} />
        </InlinePoints>
      </Box>
      {isReadOnly ? null : (
        <Box sx={{ display: 'flex', paddingInlineEnd: 1 }}>
          <TodoActionsMenu
            todo={todo}
            onOpen={onOpen}
            onDelete={() => onDelete(todo)}
            extraActions={actions}
          />
        </Box>
      )}
    </Box>
  );
}
