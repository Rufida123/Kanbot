import { getPreference, setPreference } from '@/shared/lib/preferences';
import type { RecentItem } from '@/shared/lib/preferences';

const MAX_RECENT = 8;

export function getRecentItems(): readonly RecentItem[] {
  return getPreference('recentItems') ?? [];
}

/** Newest first, no duplicates, capped. Per-user data: cleared on sign out. */
export function addRecentItem(item: RecentItem): void {
  const rest = getRecentItems().filter((existing) => !(existing.kind === item.kind && existing.id === item.id));
  setPreference('recentItems', [item, ...rest].slice(0, MAX_RECENT));
}
