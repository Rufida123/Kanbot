import type { RawDraftTodo } from '@/features/ai/api/ai';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { TODO_LIMITS } from '@/features/todos';
import { STORY_POINT_VALUES } from '@/shared/config/constants';
import { TODO_PRIORITIES, TODO_TYPES } from '@/shared/types/api';
import type { StoryPoints, TodoPriority, TodoType } from '@/shared/types/api';
import { isOneOf } from '@/shared/utils/isOneOf';

/** A suggested todo the user can still edit. It lives in the dialog's state, never in a store or the cache. */
export type TodoDraft = {
  /** Local id (React key, edits). Not a todo id. */
  id: string;
  checked: boolean;
  title: string;
  description: string;
  type: TodoType;
  priority: TodoPriority;
  storyPoints: StoryPoints | null;
};

const DEFAULT_TYPE: TodoType = 'task';
const DEFAULT_PRIORITY: TodoPriority = 'medium';

function toText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function toDraft(raw: RawDraftTodo): TodoDraft | null {
  const title = toText(raw.title, TODO_LIMITS.titleMax);
  if (title === '') return null;
  return {
    id: crypto.randomUUID(),
    checked: true,
    title,
    description: toText(raw.description, TODO_LIMITS.descriptionMax),
    type: isOneOf(TODO_TYPES, raw.type) ? raw.type : DEFAULT_TYPE,
    priority: isOneOf(TODO_PRIORITIES, raw.priority) ? raw.priority : DEFAULT_PRIORITY,
    storyPoints: isOneOf(STORY_POINT_VALUES, raw.storyPoints) ? raw.storyPoints : null,
  };
}

/**
 * The safety net for untrusted AI output: trims and cuts text to the todo limits, replaces an
 * unknown type or priority with the defaults, replaces a point value outside the Fibonacci list
 * with "not estimated", drops items without a title and keeps at most 50 (the bulk limit).
 */
export function toDrafts(rawTodos: readonly RawDraftTodo[]): TodoDraft[] {
  const drafts: TodoDraft[] = [];
  for (const raw of rawTodos) {
    const draft = toDraft(raw);
    if (draft !== null) drafts.push(draft);
    if (drafts.length === AI_LIMITS.draftsMax) break;
  }
  return drafts;
}
