import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useMediaQuery from '@mui/material/useMediaQuery';
import { memo } from 'react';
import { useMoveActions } from '@/features/backlog/context/MoveActionsContext';
import type { ContainerId } from '@/features/backlog/utils/containerIds';
import { TodoRow } from '@/features/todos';
import { REDUCED_MOTION_QUERY } from '@/shared/dnd/config';
import { DragHandle } from '@/shared/dnd/DragHandle';
import { motion } from '@/shared/theme/tokens';
import type { Todo } from '@/shared/types/api';

type SortableTodoRowProps = {
  todo: Todo;
  index: number;
  containerId: ContainerId;
  onOpen: (todoId: string) => void;
  onDelete: (todo: Todo) => void;
};

/**
 * A backlog or sprint row that can be dragged by its handle. The container id travels with the
 * item (`data`), so the drag logic knows which list it started in. Memoized because every row of
 * every list re-renders on each drag-over otherwise.
 */
export const SortableTodoRow = memo(function SortableTodoRow({
  todo,
  index,
  containerId,
  onOpen,
  onDelete,
}: SortableTodoRowProps) {
  const getMoveActions = useMoveActions();
  const isReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: todo.id,
      data: { containerId },
      transition: isReducedMotion ? null : { duration: motion.durationMs.base, easing: motion.easing },
    });

  return (
    <TodoRow
      todo={todo}
      index={index}
      onOpen={onOpen}
      onDelete={onDelete}
      menuActions={getMoveActions(todo)}
      rootRef={setNodeRef}
      rootStyle={{ transform: CSS.Translate.toString(transform), transition }}
      isDragging={isDragging}
      hasEnterAnimation={false}
      dragHandle={
        <DragHandle
          todoKey={todo.key}
          activatorRef={setActivatorNodeRef}
          activatorProps={{ ...attributes, ...listeners }}
        />
      }
    />
  );
});
