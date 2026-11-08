import { t } from '@/shared/i18n';
import { api, ApiError } from '@/shared/api/client';
import { isOneOf } from '@/shared/utils/isOneOf';
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintStatus,
  StartSprintRequest,
  UpdateSprintRequest,
} from '@/shared/types/api';

const SPRINT_STATUSES: readonly SprintStatus[] = ['planned', 'active', 'completed'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

export function isSprint(value: unknown): value is Sprint {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.projectId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.goal === 'string' &&
    isNullableString(value.startDate) &&
    isNullableString(value.endDate) &&
    isOneOf(SPRINT_STATUSES, value.status) &&
    isRecord(value.stats)
  );
}

export function unexpectedResponse(): ApiError {
  return new ApiError({
    status: null,
    code: 'UNEXPECTED_RESPONSE',
    message: t('common:errors.generic'),
  });
}

/** The `{ sprint }` body returned by create, update and start. */
function assertSprint(data: unknown): Sprint {
  if (isRecord(data) && isSprint(data.sprint)) return data.sprint;
  throw unexpectedResponse();
}

export async function listSprints(projectId: string, signal?: AbortSignal): Promise<Sprint[]> {
  const data = await api.get<unknown>(`/projects/${projectId}/sprints`, { signal });
  if (isRecord(data) && Array.isArray(data.sprints) && data.sprints.every(isSprint)) {
    return data.sprints;
  }
  throw unexpectedResponse();
}

/** One sprint by id (404 for an unknown id or another user's sprint). */
export async function getSprint(sprintId: string, signal?: AbortSignal): Promise<Sprint> {
  return assertSprint(await api.get<unknown>(`/sprints/${sprintId}`, { signal }));
}

export async function createSprint(params: {
  projectId: string;
  request: CreateSprintRequest;
}): Promise<Sprint> {
  return assertSprint(await api.post<unknown>(`/projects/${params.projectId}/sprints`, params.request));
}

/** Only planned sprints are edited in the UI (the server does not check). Send only the changed fields. */
export async function updateSprint(params: {
  sprintId: string;
  changes: UpdateSprintRequest;
}): Promise<Sprint> {
  return assertSprint(await api.patch<unknown>(`/sprints/${params.sprintId}`, params.changes));
}

/** The server answers 409 for a sprint that is not planned. Already gone (404) counts as deleted. */
export async function deleteSprint(sprintId: string): Promise<void> {
  try {
    await api.delete(`/sprints/${sprintId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return;
    throw error;
  }
}

/** 409 when the sprint is not planned or another sprint is active: its message is safe to show. */
export async function startSprint(params: {
  sprintId: string;
  request: StartSprintRequest;
}): Promise<Sprint> {
  return assertSprint(await api.post<unknown>(`/sprints/${params.sprintId}/start`, params.request));
}

/**
 * Completes the active sprint. Done todos stay in it; the others go to the backlog or to a
 * planned sprint. 409 when it is not active any more, 400 when the target is no longer planned.
 */
export async function completeSprint(params: {
  sprintId: string;
  request: CompleteSprintRequest;
}): Promise<Sprint> {
  return assertSprint(await api.post<unknown>(`/sprints/${params.sprintId}/complete`, params.request));
}
