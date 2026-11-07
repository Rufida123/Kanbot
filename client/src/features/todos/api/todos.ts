import { api, ApiError } from '@/shared/api/client';
import { isOneOf } from '@/shared/utils/isOneOf';
import { STORY_POINTS, TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from '@/shared/types/api';
import type {
  BulkCreateTodosRequest,
  CreateTodoRequest,
  MoveTodoRequest,
  Todo,
  TodoListQuery,
  UpdateTodoRequest,
} from '@/shared/types/api';

function unexpectedResponse(): ApiError {
  return new ApiError({
    status: null,
    code: 'UNEXPECTED_RESPONSE',
    message: 'Something went wrong. Please try again.',
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isTodo(value: unknown): value is Todo {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.projectId === 'string' &&
    typeof value.key === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isNullableString(value.sprintId) &&
    isOneOf(TODO_TYPES, value.type) &&
    isOneOf(TODO_STATUSES, value.status) &&
    isOneOf(TODO_PRIORITIES, value.priority) &&
    (value.storyPoints === null || isOneOf(STORY_POINTS, value.storyPoints)) &&
    Array.isArray(value.labels) &&
    value.labels.every((label) => typeof label === 'string') &&
    isNullableString(value.dueDate) &&
    typeof value.order === 'number' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    isNullableString(value.completedAt)
  );
}

function assertTodo(data: unknown): Todo {
  if (isRecord(data) && isTodo(data.todo)) return data.todo;
  throw unexpectedResponse();
}

export async function listTodos(
  projectId: string,
  query: TodoListQuery,
  signal?: AbortSignal,
): Promise<Todo[]> {
  const data = await api.get<unknown>(`/projects/${projectId}/todos`, { params: query, signal });
  if (isRecord(data) && Array.isArray(data.todos) && data.todos.every(isTodo)) return data.todos;
  throw unexpectedResponse();
}

export async function getTodo(todoId: string, signal?: AbortSignal): Promise<Todo> {
  return assertTodo(await api.get<unknown>(`/todos/${todoId}`, { signal }));
}

export async function createTodo(params: {
  projectId: string;
  request: CreateTodoRequest;
}): Promise<Todo> {
  return assertTodo(await api.post<unknown>(`/projects/${params.projectId}/todos`, params.request));
}

export async function updateTodo(params: {
  todoId: string;
  changes: UpdateTodoRequest;
}): Promise<Todo> {
  return assertTodo(await api.patch<unknown>(`/todos/${params.todoId}`, params.changes));
}

/** Saves several todos at once (the confirmed AI drafts; the API accepts 1–50). Returns them in request order. */
export async function bulkCreateTodos(params: {
  projectId: string;
  request: BulkCreateTodosRequest;
}): Promise<Todo[]> {
  const data = await api.post<unknown>(`/projects/${params.projectId}/todos/bulk`, params.request);
  if (isRecord(data) && Array.isArray(data.todos) && data.todos.every(isTodo)) return data.todos;
  throw unexpectedResponse();
}

export async function deleteTodo(todoId: string): Promise<void> {
  await api.delete(`/todos/${todoId}`);
}

/** Moves a todo to `request.position` of the target list (0 = top). Returns the moved todo. */
export async function moveTodo(params: {
  todoId: string;
  request: MoveTodoRequest;
}): Promise<Todo> {
  return assertTodo(await api.post<unknown>(`/todos/${params.todoId}/move`, params.request));
}
