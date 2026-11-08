import { useEffect } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { useThemeStore } from '@/shared/stores/themeStore';

/**
 * Syncs the Zustand theme store with MUI's useColorScheme hook.
 * Call this in a component inside the ThemeProvider.
 */
export function useThemeSync() {
  const { setMode } = useColorScheme();
  const themeMode = useThemeStore((state) => state.mode);

  useEffect(() => {
    setMode(themeMode);
  }, [themeMode, setMode]);
}
