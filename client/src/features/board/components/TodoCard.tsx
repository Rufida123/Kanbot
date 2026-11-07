import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
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
  return (
    <Box
      component="li"
      ref={rootRef}
      style={rootStyle}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isOverlay ? 8 : 0,
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
          padding: 1.25,
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
        <Box component="span" sx={TITLE_SX}>
          {todo.title}
        </Box>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <PriorityBadge priority={todo.priority} />
          <PointsChip points={todo.storyPoints} />
        </Box>
      </ButtonBase>
      {isOverlay ? null : (
        <Box sx={{ display: 'flex', paddingBlockStart: 0.5, paddingInlineEnd: 0.5 }}>
          <TodoActionsMenu todo={todo} onOpen={onOpen} extraActions={menuActions} />
        </Box>
      )}
    </Box>
  );
}
