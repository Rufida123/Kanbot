import { useSyncExternalStore } from 'react';
import { getLabelColors } from '@/shared/lib/labelColors';
import { getPreference, subscribePreferences } from '@/shared/lib/preferences';

/** Colours of one project's labels; re-renders when they change. */
export function useLabelColors(projectId: string | undefined): Record<string, string> {
  useSyncExternalStore(subscribePreferences, () => getPreference('labelColors'));
  return projectId === undefined ? {} : getLabelColors(projectId);
}
