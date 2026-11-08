import { api } from '@/shared/api/client';
import { AI_REQUEST_TIMEOUT_MS } from '@/shared/config/api';
import { isSprint, unexpectedResponse } from '@/features/sprints';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { getLanguageHint, withLanguageHint } from '@/features/ai/utils/languageHint';
import type {
  AiSource,
  AiStatusResponse,
  ChatMessage,
  ChatResponse,
  GenerateTodosRequest,
  PlanSprintRequest,
  PlanSprintResponse,
  SprintSummary,
  SprintSummaryResponse,
} from '@/shared/types/api';

/** A real model needs more than the default 15 s, so every AI call carries its own timeout. */
const AI_REQUEST_CONFIG = { timeout: AI_REQUEST_TIMEOUT_MS } as const;

/**
 * One suggested todo exactly as the server sent it. Its values are NOT trusted (a real model can
 * invent a type or a point value): `toDrafts` turns it into a safe draft.
 */
export type RawDraftTodo = Readonly<Record<string, unknown>>;

export type GenerateTodosResult = { todos: readonly RawDraftTodo[]; source: AiSource };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAiSource(value: unknown): value is AiSource {
  return value === 'mock' || value === 'ai';
}

function isSprintSummary(value: unknown): value is SprintSummary {
  return (
    isRecord(value) &&
    typeof value.content === 'string' &&
    typeof value.generatedAt === 'string' &&
    isAiSource(value.source)
  );
}

/** GET /ai/status. Quick, so it keeps the default timeout. */
export async function getAiStatus(signal?: AbortSignal): Promise<AiStatusResponse> {
  const data = await api.get<unknown>('/ai/status', { signal });
  if (
    isRecord(data) &&
    isAiSource(data.mode) &&
    (data.model === null || typeof data.model === 'string')
  ) {
    return { mode: data.mode, model: data.model };
  }
  throw unexpectedResponse();
}

/** POST /projects/:id/ai/chat. Stateless: `messages` is the whole conversation. */
export async function sendChat(params: {
  projectId: string;
  messages: readonly ChatMessage[];
  signal?: AbortSignal;
}): Promise<ChatResponse> {
  const data = await api.post<unknown>(
    `/projects/${params.projectId}/ai/chat`,
    { messages: params.messages },
    { ...AI_REQUEST_CONFIG, signal: params.signal },
  );
  if (
    isRecord(data) &&
    isRecord(data.message) &&
    data.message.role === 'assistant' &&
    typeof data.message.content === 'string' &&
    data.message.content.trim() !== '' &&
    isAiSource(data.source)
  ) {
    return {
      message: { role: 'assistant', content: data.message.content },
      source: data.source,
    };
  }
  throw unexpectedResponse();
}

/** POST /projects/:id/ai/generate-todos. Returns drafts; nothing is saved. */
export async function generateTodos(params: {
  projectId: string;
  request: GenerateTodosRequest;
  signal?: AbortSignal;
}): Promise<GenerateTodosResult> {
  const data = await api.post<unknown>(
    `/projects/${params.projectId}/ai/generate-todos`,
    // The language hint is part of the prompt text (frontend only, no backend change).
    { ...params.request, prompt: withLanguageHint(params.request.prompt, AI_LIMITS.promptMax) },
    { ...AI_REQUEST_CONFIG, signal: params.signal },
  );
  if (isRecord(data) && Array.isArray(data.todos) && isAiSource(data.source)) {
    return { todos: data.todos.filter(isRecord), source: data.source };
  }
  throw unexpectedResponse();
}

/** POST /projects/:id/ai/plan-sprint. Returns a suggestion; nothing is saved. */
export async function planSprint(params: {
  projectId: string;
  request: PlanSprintRequest;
  signal?: AbortSignal;
}): Promise<PlanSprintResponse> {
  const data = await api.post<unknown>(
    `/projects/${params.projectId}/ai/plan-sprint`,
    {
      ...params.request,
      focus:
        params.request.focus === undefined ? getLanguageHint() : withLanguageHint(params.request.focus, AI_LIMITS.focusMax),
    },
    { ...AI_REQUEST_CONFIG, signal: params.signal },
  );
  if (
    isRecord(data) &&
    typeof data.goal === 'string' &&
    Array.isArray(data.todoIds) &&
    data.todoIds.every((id) => typeof id === 'string') &&
    typeof data.totalPoints === 'number' &&
    typeof data.reasoning === 'string' &&
    isAiSource(data.source)
  ) {
    return {
      goal: data.goal,
      todoIds: data.todoIds,
      totalPoints: data.totalPoints,
      reasoning: data.reasoning,
      source: data.source,
    };
  }
  throw unexpectedResponse();
}

/** POST /sprints/:id/ai/summary. The server saves the summary on the sprint (409 for a planned one). */
export async function requestSprintSummary(params: {
  sprintId: string;
  signal?: AbortSignal;
}): Promise<SprintSummaryResponse> {
  const data = await api.post<unknown>(`/sprints/${params.sprintId}/ai/summary`, undefined, {
    ...AI_REQUEST_CONFIG,
    signal: params.signal,
  });
  if (isRecord(data) && isSprint(data.sprint) && isSprintSummary(data.summary)) {
    return { sprint: data.sprint, summary: data.summary };
  }
  throw unexpectedResponse();
}
