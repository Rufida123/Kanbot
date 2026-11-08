import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router';
import rtlPlugin from 'stylis-plugin-rtl';
import { getDirection } from '@/shared/i18n';
import { queryClient } from '@/shared/lib/queryClient';
import { createAppTheme } from '@/shared/theme/theme';
import { DEFAULT_THEME_MODE, preferencesStorageManager } from '@/shared/theme/themeStorage';

/** Emotion caches are created once: RTL flips any physical `left/right` CSS (logical CSS is untouched). */
const ltrCache = createCache({ key: 'kb-ltr' });
const rtlCache = createCache({ key: 'kb-rtl', stylisPlugins: [rtlPlugin] });
const themes = { ltr: createAppTheme('ltr'), rtl: createAppTheme('rtl') } as const;

export function AppProviders({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  const direction = getDirection(i18n.language);
  const cache = useMemo(() => (direction === 'rtl' ? rtlCache : ltrCache), [direction]);

  return (
    // Dark is the default; Light / Dark / System is saved by `preferences.ts` (not MUI's own
    // localStorage key), so the base app still stores nothing but the JWT.
    <CacheProvider value={cache}>
      <ThemeProvider
        theme={themes[direction]}
        defaultMode={DEFAULT_THEME_MODE}
        storageManager={preferencesStorageManager}
      >
        <CssBaseline enableColorScheme />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
