import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { DragHandle } from '@/shared/dnd/DragHandle';
import { SortableTodoRow } from '@/features/backlog/components/SortableTodoRow';
import { useMoveActions } from '@/features/backlog/context/MoveActionsContext';
import { usePreviewedTodos } from '@/features/backlog/context/DragPreviewContext';
import { useSelection } from '@/features/backlog/context/SelectionContext';
import type { ContainerId } from '@/features/backlog/utils/containerIds';
import { TodoList, TodoRow } from '@/features/todos';
import type { Todo } from '@/shared/types/api';

type DropListProps = {
  containerId: ContainerId;
  todos: readonly Todo[];
  /** Accessible name of the list. */
  label: string;
  /**
   * `true`: rows are sortable and the list accepts drops (inside `BacklogDndProvider`).
   * `false`: plain rows; a `lockedReason` shows disabled handles with that reason.
   */
  isSortable: boolean;
  lockedReason?: string | null;
  /** Shown instead of the rows when the list is empty; inside the drop area, so an empty list accepts drops. */
  emptyContent: ReactNode;
};

/** One list of rows: a droppable area, a `SortableContext` and its rows. */
export function DropList({ containerId, todos, label, isSortable, lockedReason = null, emptyContent }: DropListProps) {
  const getMoveActions = useMoveActions();
  const shownTodos = usePreviewedTodos(containerId, todos);
  const selection = useSelection();
  // Selection mode pauses drag and drop: rows get checkboxes instead of drag handles.
  const isDragEnabled = isSortable && !selection.isActive;
  const { setNodeRef, isOver } = useDroppable({ id: containerId, disabled: !isDragEnabled });

  if (!isDragEnabled) {
    if (shownTodos.length === 0) return <>{emptyContent}</>;
    return (
      <TodoList
        todos={shownTodos}
        label={label}
        renderRow={({ todo, index, onOpen, onDelete }) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            index={index}
            onOpen={onOpen}
            onDelete={onDelete}
            menuActions={getMoveActions(todo)}
            selection={
              selection.isActive
                ? { isSelected: selection.selectedIds.has(todo.id), onToggle: selection.toggle }
                : undefined
            }
            dragHandle={
              lockedReason === null || selection.isActive ? undefined : (
                <DragHandle todoKey={todo.key} disabledReason={lockedReason} />
              )
            }
          />
        )}
      />
    );
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: '3rem',
        outline: isOver ? '2px dashed' : 'none',
        outlineColor: 'primary.main',
        outlineOffset: '-2px',
      }}
    >
      <SortableContext items={shownTodos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
        {shownTodos.length === 0 ? (
          emptyContent
        ) : (
          <TodoList
            todos={shownTodos}
            label={label}
            renderRow={({ todo, index, onOpen, onDelete }) => (
              <SortableTodoRow
                key={todo.id}
                todo={todo}
                index={index}
                containerId={containerId}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            )}
          />
        )}
      </SortableContext>
    </Box>
  );
}
