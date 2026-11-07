import type { TodoDraft } from '@/features/ai/utils/toDrafts';

export function getCheckedDrafts(drafts: readonly TodoDraft[]): TodoDraft[] {
  return drafts.filter((draft) => draft.checked);
}

export function isDraftTitleMissing(draft: TodoDraft): boolean {
  return draft.title.trim() === '';
}

/** A selected draft without a title cannot be saved: the button stays disabled until it has one. */
export function hasCheckedDraftWithoutTitle(drafts: readonly TodoDraft[]): boolean {
  return getCheckedDrafts(drafts).some(isDraftTitleMissing);
}
