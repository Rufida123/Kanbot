import { api, ApiError } from '@/shared/api/client';
import type {
  CreateProjectRequest,
  ProjectWithStats,
  UpdateProjectRequest,
} from '@/shared/types/api';

const PROJECTS_PATH = '/projects';

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

function isProjectWithStats(value: unknown): value is ProjectWithStats {
  if (!isRecord(value) || !isRecord(value.stats)) return false;
  const { activeSprint } = value.stats;
  const isActiveSprintValid =
    activeSprint === null ||
    (isRecord(activeSprint) &&
      typeof activeSprint.id === 'string' &&
      typeof activeSprint.name === 'string');
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.key === 'string' &&
    typeof value.description === 'string' &&
    typeof value.stats.backlogCount === 'number' &&
    typeof value.stats.totalTodos === 'number' &&
    isActiveSprintValid
  );
}

function assertProject(data: unknown): ProjectWithStats {
  if (isRecord(data) && isProjectWithStats(data.project)) return data.project;
  throw unexpectedResponse();
}

export async function listProjects(signal?: AbortSignal): Promise<ProjectWithStats[]> {
  const data = await api.get<unknown>(PROJECTS_PATH, { signal });
  if (isRecord(data) && Array.isArray(data.projects) && data.projects.every(isProjectWithStats)) {
    return data.projects;
  }
  throw unexpectedResponse();
}

export async function getProject(projectId: string, signal?: AbortSignal): Promise<ProjectWithStats> {
  return assertProject(await api.get<unknown>(`${PROJECTS_PATH}/${projectId}`, { signal }));
}

export async function createProject(body: CreateProjectRequest): Promise<ProjectWithStats> {
  return assertProject(await api.post<unknown>(PROJECTS_PATH, body));
}

export async function updateProject(params: {
  projectId: string;
  changes: UpdateProjectRequest;
}): Promise<ProjectWithStats> {
  const { projectId, changes } = params;
  return assertProject(await api.patch<unknown>(`${PROJECTS_PATH}/${projectId}`, changes));
}

/** Deleting something that is already gone (another tab) counts as done. */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await api.delete(`${PROJECTS_PATH}/${projectId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return;
    throw error;
  }
}
