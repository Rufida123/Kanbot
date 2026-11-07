import { api, ApiError } from '@/shared/api/client';
import { isSprint, unexpectedResponse } from '@/features/sprints/api/sprints';
import { TODO_STATUSES } from '@/shared/types/api';
import type { SprintBoardResponse } from '@/shared/types/api';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTodoLike(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && typeof value.status === 'string';
}

/** The sprint plus one array per status; anything else is an unexpected response. */
export function isBoardResponse(value: unknown): value is SprintBoardResponse {
  if (!isRecord(value) || !isSprint(value.sprint) || !isRecord(value.columns)) return false;
  const { columns } = value;
  return TODO_STATUSES.every((status) => {
    const column = columns[status];
    return Array.isArray(column) && column.every(isTodoLike);
  });
}

/** GET /sprints/:id/todos: the board of a sprint, one request for all four columns. */
export async function getBoard(sprintId: string, signal?: AbortSignal): Promise<SprintBoardResponse> {
  const data = await api.get<unknown>(`/sprints/${sprintId}/todos`, { signal });
  if (isBoardResponse(data)) return data;
  throw unexpectedResponse();
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
