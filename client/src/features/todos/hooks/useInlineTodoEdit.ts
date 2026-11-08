import { useTranslation } from 'react-i18next';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { useUpdateTodo } from '@/features/todos/hooks/useUpdateTodo';
import type { StoryPoints, Todo, TodoPriority } from '@/shared/types/api';

/** Optimistic inline edits of title, points and priority for rows and cards (enhancement 6). */
export function useInlineTodoEdit(todo: Pick<Todo, 'id' | 'projectId' | 'sprintId'>) {
  const { t } = useTranslation();
  const mutation = useUpdateTodo();
  const base = { todoId: todo.id, previous: { projectId: todo.projectId, sprintId: todo.sprintId }, isOptimistic: true, isSilent: true } as const;
  return {
    /** Returns an error message to show next to the field, or `null` when the edit was sent. */
    saveTitle: (title: string): string | null => {
      if (title === '') return t('todos:validation.titleRequired');
      if (title.length > TODO_LIMITS.titleMax) return t('todos:validation.titleMax', { max: TODO_LIMITS.titleMax });
      mutation.mutate({ ...base, changes: { title } });
      return null;
    },
    savePoints: (storyPoints: StoryPoints | null) => mutation.mutate({ ...base, changes: { storyPoints } }),
    savePriority: (priority: TodoPriority) => mutation.mutate({ ...base, changes: { priority } }),
  };
}
