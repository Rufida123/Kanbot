import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { TodoActionsMenu } from '@/features/todos/components/TodoActionsMenu';
import type { TodoMenuAction } from '@/features/todos/components/TodoActionsMenu';
import { LabelChips } from '@/shared/components/LabelChips';
import { PointsChip } from '@/shared/components/PointsChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TypeIcon } from '@/shared/components/TypeIcon';
import { staggeredEnterSx } from '@/shared/theme/motion';
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
  /** Sortable rows skip the enter animation: its final `transform` would override the drag transform. */
  hasEnterAnimation?: boolean;
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
  hasEnterAnimation = true,
}: TodoRowProps) {
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
        backgroundColor: 'background.paper',
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
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
          columnGap: 1.5,
          rowGap: 0.75,
          paddingBlock: 1.25,
          paddingInlineStart: dragHandle === undefined ? 2 : 0.5,
          paddingInlineEnd: 1,
          textAlign: 'start',
          transition: (theme) => theme.transitions.create('background-color'),
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <TypeIcon type={todo.type} />
        <Box
          component="span"
          sx={{
            minWidth: '4.25rem',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {todo.key}
        </Box>
        <Box component="span" sx={TITLE_SX}>
          {todo.title}
        </Box>
        <Box
          component="span"
          sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 1.5, rowGap: 0.5, marginInlineStart: 'auto' }}
        >
          <LabelChips labels={todo.labels} />
          <PriorityBadge priority={todo.priority} />
          <PointsChip points={todo.storyPoints} />
        </Box>
      </ButtonBase>
      <Box sx={{ display: 'flex', paddingInlineEnd: 1 }}>
        <TodoActionsMenu
          todo={todo}
          onOpen={onOpen}
          onDelete={() => onDelete(todo)}
          extraActions={menuActions}
        />
      </Box>
    </Box>
  );
}
