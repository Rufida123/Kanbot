import Box from '@mui/material/Box';
import { TodoRow } from '@/features/todos/components/TodoRow';
import { useTodoDialogParam } from '@/features/todos/hooks/useTodoDialogParam';
import { useTodoDeleteStore } from '@/features/todos/store/todoDeleteStore';
import type { Todo } from '@/shared/types/api';

type TodoListProps = {
  todos: readonly Todo[];
  /** Accessible name of the list ("Backlog"). */
  label: string;
};

/**
 * The rows of one list, in the order given. It owns no data and no scroll, so Sprint 4 can
 * wrap it in a `SortableContext`. Opening and deleting go through the URL and the delete store.
 */
export function TodoList({ todos, label }: TodoListProps) {
  const { openTodo } = useTodoDialogParam();
  const requestDelete = useTodoDeleteStore((state) => state.request);

  return (
    <Box component="ul" aria-label={label} sx={{ listStyle: 'none' }}>
      {todos.map((todo, index) => (
        <TodoRow
          key={todo.id}
          todo={todo}
          index={index}
          onOpen={openTodo}
          onDelete={requestDelete}
        />
      ))}
    </Box>
  );
}
