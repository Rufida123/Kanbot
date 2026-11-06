import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { TodoRow } from '@/features/todos/components/TodoRow';
import { useTodoDialogParam } from '@/features/todos/hooks/useTodoDialogParam';
import { useTodoDeleteStore } from '@/features/todos/store/todoDeleteStore';
import type { Todo } from '@/shared/types/api';

type TodoListProps = {
  todos: readonly Todo[];
  /** Accessible name of the list ("Backlog"). */
  label: string;
  /** Renders a row in place of the default one (Sprint 4 uses it for sortable rows). */
  renderRow?: (row: RowArgs) => ReactNode;
};

export type RowArgs = {
  todo: Todo;
  index: number;
  onOpen: (todoId: string) => void;
  onDelete: (todo: Todo) => void;
};

/**
 * The rows of one list, in the order given. It owns no data and no scroll, so it can sit inside
 * a `SortableContext`. Opening and deleting go through the URL and the delete store.
 */
export function TodoList({ todos, label, renderRow }: TodoListProps) {
  const { openTodo } = useTodoDialogParam();
  const requestDelete = useTodoDeleteStore((state) => state.request);

  return (
    <Box component="ul" aria-label={label} sx={{ listStyle: 'none' }}>
      {todos.map((todo, index) =>
        renderRow ? (
          renderRow({ todo, index, onOpen: openTodo, onDelete: requestDelete })
        ) : (
          <TodoRow
            key={todo.id}
            todo={todo}
            index={index}
            onOpen={openTodo}
            onDelete={requestDelete}
          />
        ),
      )}
    </Box>
  );
}
