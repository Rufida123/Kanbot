import type { TodoFormValues } from '@/features/todos/components/todo-details-dialog/config';
import { normalizeLabels } from '@/features/todos/utils/normalizeLabels';
import { STORY_POINT_VALUES } from '@/shared/config/constants';
import type { StoryPoints, Todo, UpdateTodoRequest } from '@/shared/types/api';

type SavedTodo = Pick<
  Todo,
  | 'title'
  | 'description'
  | 'type'
  | 'status'
  | 'priority'
  | 'storyPoints'
  | 'labels'
  | 'dueDate'
  | 'sprintId'
>;

function toStoryPoints(value: string): StoryPoints | null {
  return STORY_POINT_VALUES.find((points) => String(points) === value) ?? null;
}

function areSameLabels(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((label, index) => label === second[index]);
}

/** Saved values as form values: the form's defaults, and the baseline the changes are measured from. */
export function toTodoFormValues(todo: SavedTodo): TodoFormValues {
  return {
    title: todo.title,
    description: todo.description,
    type: todo.type,
    status: todo.status,
    priority: todo.priority,
    storyPoints: todo.storyPoints === null ? '' : String(todo.storyPoints),
    labels: [...todo.labels],
    dueDate: todo.dueDate ?? '',
    sprintId: todo.sprintId ?? '',
  };
}

/**
 * The PATCH body: only fields whose normalized value differs from the saved todo
 * (trimmed text, labels compared by content). Never `order`. An untouched form gives `{}`.
 */
export function getTodoChanges(todo: SavedTodo, values: TodoFormValues): UpdateTodoRequest {
  const title = values.title.trim();
  const description = values.description.trim();
  const labels = normalizeLabels(values.labels);
  const storyPoints = toStoryPoints(values.storyPoints);
  const dueDate = values.dueDate === '' ? null : values.dueDate;
  const sprintId = values.sprintId === '' ? null : values.sprintId;

  return {
    ...(title !== todo.title.trim() && { title }),
    ...(description !== todo.description.trim() && { description }),
    ...(values.type !== todo.type && { type: values.type }),
    ...(values.status !== todo.status && { status: values.status }),
    ...(values.priority !== todo.priority && { priority: values.priority }),
    ...(storyPoints !== todo.storyPoints && { storyPoints }),
    ...(!areSameLabels(labels, todo.labels) && { labels }),
    ...(dueDate !== todo.dueDate && { dueDate }),
    ...(sprintId !== todo.sprintId && { sprintId }),
  };
}

export function hasTodoChanges(changes: UpdateTodoRequest): boolean {
  return Object.keys(changes).length > 0;
}
