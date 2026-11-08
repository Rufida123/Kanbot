import { create } from 'zustand';
import { preferences } from '@/shared/lib/preferences';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  systemPreference: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setSystemPreference: (preference: 'light' | 'dark') => void;
  /**
   * Get the effective theme: resolves 'system' to 'light' or 'dark' based on system preference.
   */
  getEffectiveMode: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (preferences.getThemeMode() || 'system') as ThemeMode,
  systemPreference: getSystemPreference(),
  
  setMode: (mode: ThemeMode) => {
    preferences.setThemeMode(mode);
    set({ mode });
  },

  setSystemPreference: (preference: 'light' | 'dark') => {
    set({ systemPreference: preference });
  },

  getEffectiveMode: () => {
    const state = get();
    if (state.mode === 'system') {
      return state.systemPreference;
    }
    return state.mode;
  },
}));

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Listen for system preference changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    useThemeStore.setState({
      systemPreference: e.matches ? 'dark' : 'light',
    });
  };

  // Modern API
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }
}
