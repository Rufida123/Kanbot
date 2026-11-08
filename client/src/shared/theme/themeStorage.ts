import { getPreference, setPreference } from '@/shared/lib/preferences';
import type { ThemeMode } from '@/shared/lib/preferences';

export const DEFAULT_THEME_MODE: ThemeMode = 'dark';
const MODE_STORAGE_KEY = 'mui-mode';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * MUI storage manager backed by `preferences.ts` (the only enhancement storage).
 * MUI asks for three keys; only the mode is persisted, the scheme names are derived from it.
 */
export function preferencesStorageManager({ key }: { key: string }) {
  const isMode = key === MODE_STORAGE_KEY;
  return {
    get: (defaultValue: unknown) => {
      if (!isMode) return defaultValue;
      const saved = getPreference('themeMode');
      return isThemeMode(saved) ? saved : defaultValue;
    },
    set: (value: unknown) => {
      if (isMode && isThemeMode(value)) setPreference('themeMode', value);
    },
    subscribe: () => () => undefined,
  };
}

/**
 * Runs before React renders (imported first in `main.tsx`): puts the saved colour scheme on
 * `<html>` so the first paint already has the right colours (no flash of the wrong theme).
 */
export function applyInitialColorScheme(): void {
  const saved = getPreference('themeMode');
  const mode: ThemeMode = isThemeMode(saved) ? saved : DEFAULT_THEME_MODE;
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const scheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  document.documentElement.setAttribute('data-mui-color-scheme', scheme);
  document.documentElement.style.colorScheme = scheme;
}
