import { api, ApiError } from '@/shared/api/client';
import { isOneOf } from '@/shared/utils/isOneOf';
import type { Sprint, SprintStatus } from '@/shared/types/api';

const SPRINT_STATUSES: readonly SprintStatus[] = ['planned', 'active', 'completed'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isSprint(value: unknown): value is Sprint {
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

/** Read-only in Sprint 3: the todo form needs the planned/active sprints for its select. */
export async function listSprints(projectId: string, signal?: AbortSignal): Promise<Sprint[]> {
  const data = await api.get<unknown>(`/projects/${projectId}/sprints`, { signal });
  if (isRecord(data) && Array.isArray(data.sprints) && data.sprints.every(isSprint)) {
    return data.sprints;
  }
  throw new ApiError({
    status: null,
    code: 'UNEXPECTED_RESPONSE',
    message: 'Something went wrong. Please try again.',
  });
}
