import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router';
import { queryClient } from '@/shared/lib/queryClient';
import { theme } from '@/shared/theme/theme';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    // Dark is the default. `storageManager={null}` keeps MUI from persisting the mode in
    // localStorage: only the JWT may be stored client-side (NFR-7). Persistence is Sprint 7.
    <ThemeProvider theme={theme} defaultMode="dark" storageManager={null}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
