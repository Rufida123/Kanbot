import { getCheckedDrafts } from '@/features/ai/utils/draftSelectors';
import type { TodoDraft } from '@/features/ai/utils/toDrafts';
import type { CreateTodoRequest } from '@/shared/types/api';

/**
 * The checked drafts as create requests. No `sprintId`: they land in the backlog.
 * `order` is never sent (the server computes it).
 */
export function mapDraftsToCreateRequests(drafts: readonly TodoDraft[]): CreateTodoRequest[] {
  return getCheckedDrafts(drafts).map((draft) => ({
    title: draft.title.trim(),
    description: draft.description,
    type: draft.type,
    priority: draft.priority,
    storyPoints: draft.storyPoints,
  }));
}
