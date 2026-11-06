import { useState } from 'react';
import { TodoDetailsForm } from '@/features/todos/components/todo-details-dialog/TodoDetailsForm';
import {
  TodoDialogError,
  TodoDialogLoading,
} from '@/features/todos/components/todo-details-dialog/TodoDialogStates';
import { useTodo } from '@/features/todos/hooks/useTodo';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import { ApiError } from '@/shared/api/client';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

type TodoDetailsDialogProps = {
  todoId: string;
  /** The project of the current URL: a todo of another project counts as not found. */
  projectId: string;
  onClose: () => void;
};

function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/**
 * Details dialog (BL-3): loading, not found / error and the edit form. Mount it only while a
 * todo is open (`key={todoId}`), so every opening starts with a fresh form.
 */
export function TodoDetailsDialog({ todoId, projectId, onClose }: TodoDetailsDialogProps) {
  const { data: todo, error, isError, isPlaceholderData, refetch } = useTodo(todoId);
  const sprintsQuery = useSprints(projectId);
  // Whether the first thing shown was the loader: later states then replace it without a new fade-in.
  const [startedWithLoader] = useState(todo === undefined || isPlaceholderData);

  // A deleted todo is "not found" even if an older copy is still cached.
  if (isError && (todo === undefined || isNotFoundError(error))) {
    return (
      <TodoDialogError
        isReplacingLoader={startedWithLoader}
        isNotFound={isNotFoundError(error)}
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
        onClose={onClose}
      />
    );
  }
  if (todo !== undefined && !isPlaceholderData && todo.projectId !== projectId) {
    return (
      <TodoDialogError
        isReplacingLoader={startedWithLoader}
        isNotFound
        message=""
        onRetry={() => undefined}
        onClose={onClose}
      />
    );
  }
  if (todo === undefined || isPlaceholderData) {
    return <TodoDialogLoading todoKey={todo?.key ?? null} onClose={onClose} />;
  }
  return (
    <TodoDetailsForm
      todo={todo}
      sprints={sprintsQuery.data}
      isSprintsError={sprintsQuery.isError}
      isReplacingLoader={startedWithLoader}
      onClose={onClose}
    />
  );
}
