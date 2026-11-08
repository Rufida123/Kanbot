import { useCallback, useSyncExternalStore } from 'react';
import { getPreference, setPreference, subscribePreferences } from '@/shared/lib/preferences';
import type { Preferences } from '@/shared/lib/preferences';

/** Reads one enhancement preference and re-renders when it changes (via `preferences.ts` only). */
export function usePreference<TKey extends keyof Preferences>(
  key: TKey,
): [Preferences[TKey], (value: Preferences[TKey] | undefined) => void] {
  const value = useSyncExternalStore(subscribePreferences, () => getPreference(key));
  const set = useCallback((next: Preferences[TKey] | undefined) => setPreference(key, next), [key]);
  return [value, set];
}
