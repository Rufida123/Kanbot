import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TodoCard } from '@/features/board/components/TodoCard';
import type { ColumnId } from '@/features/board/utils/boardContainers';
import { REDUCED_MOTION_QUERY } from '@/shared/dnd/config';
import { DragHandle } from '@/shared/dnd/DragHandle';
import { motion } from '@/shared/theme/tokens';
import type { TodoMenuAction } from '@/features/todos/components/TodoActionsMenu';
import type { Todo } from '@/shared/types/api';

type SortableTodoCardProps = {
  todo: Todo;
  columnId: ColumnId;
  menuActions: readonly TodoMenuAction[];
  onOpen: (todoId: string) => void;
};

/**
 * A card that can be dragged by its handle. The column id travels with the item (`data`), so
 * the drag logic knows which column it started in.
 */
export function SortableTodoCard({ todo, columnId, menuActions, onOpen }: SortableTodoCardProps) {
  const isReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: todo.id,
      data: { columnId },
      transition: isReducedMotion ? null : { duration: motion.durationMs.base, easing: motion.easing },
    });

  return (
    <TodoCard
      todo={todo}
      onOpen={onOpen}
      menuActions={menuActions}
      rootRef={setNodeRef}
      rootStyle={{ transform: CSS.Translate.toString(transform), transition }}
      isDragging={isDragging}
      dragHandle={
        <DragHandle
          verb="move"
          todoKey={todo.key}
          activatorRef={setActivatorNodeRef}
          activatorProps={{ ...attributes, ...listeners }}
        />
      }
    />
  );
}
