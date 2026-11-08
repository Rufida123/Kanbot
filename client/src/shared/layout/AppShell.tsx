import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { AiDialogsHost } from '@/features/ai';
import { ProjectDialogsHost, useRemoveDeletedProjectCaches } from '@/features/projects';
import { TodoDetailsHost, useFlushDeletes } from '@/features/todos';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { ToastHost } from '@/shared/components/ToastHost';
import { BottomNav, BOTTOM_NAV_HEIGHT_REM } from '@/shared/layout/BottomNav';
import { CommandPalette } from '@/shared/layout/CommandPalette';
import { GlobalShortcuts } from '@/shared/layout/GlobalShortcuts';
import { ShortcutsDialog } from '@/shared/layout/ShortcutsDialog';
import { AssistantDrawer } from '@/shared/layout/AssistantDrawer';
import { DESKTOP_MEDIA_QUERY, SIDEBAR_WIDTH_REM } from '@/shared/layout/layout';
import { Sidebar } from '@/shared/layout/Sidebar';
import { TopBar } from '@/shared/layout/TopBar';
import { pageEnterSx } from '@/shared/theme/motion';
import { useUiStore } from '@/shared/stores/uiStore';
import { LoadingScreen } from '@/shared/components/LoadingScreen';

const SIDEBAR_PAPER_SX = {
  width: `${SIDEBAR_WIDTH_REM}rem`,
  maxWidth: '85vw',
  backgroundColor: 'background.paper',
} as const;

/**
 * Layout route of the private area. The sidebar and top bar stay mounted while only the
 * content in `<Outlet/>` changes. Permanent sidebar from 1024px, a drawer below.
 */
export function AppShell() {
  const { i18n } = useTranslation();
  // Parent of every project observer: see the hook for why the position matters.
  useRemoveDeletedProjectCaches();
  // Commits delayed (undoable) deletes when the route changes or the tab closes.
  useFlushDeletes();

  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY, { noSsr: true });
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const { pathname } = useLocation();
  const projectId = useParams()[PROJECT_ID_PARAM];

  // The drawer closes after every navigation and when the screen grows past the breakpoint.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, isDesktop, setMobileNavOpen]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || isMobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        sx={{ width: isDesktop ? `${SIDEBAR_WIDTH_REM}rem` : 0, flexShrink: 0 }}
        slotProps={{ paper: { sx: SIDEBAR_PAPER_SX } }}
      >
        <Sidebar />
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <OfflineBanner />
        <TopBar isDesktop={isDesktop} />
        <Box
          component="main"
          id="main-content"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            padding: { xs: 2, md: 3 },
            // Room for the mobile bottom navigation and the iOS home indicator.
            paddingBottom: projectId === undefined ? undefined : { xs: `calc(${BOTTOM_NAV_HEIGHT_REM + 1.5}rem + env(safe-area-inset-bottom))`, md: 3 },
            paddingInline: { xs: 'max(1rem, env(safe-area-inset-left))', md: 3 },
          }}
        >
          {/* `key`: each page fades in when the route changes. The language is part of the key so a
              language switch re-renders every helper that reads the active language. */}
          <Box key={`${pathname}|${i18n.language}`} sx={pageEnterSx}>
            <ErrorBoundary scope="route" resetKey={pathname}>
              <Suspense fallback={<LoadingScreen />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </Box>

        </Box>
      </Box>
      <AssistantDrawer />
      <ProjectDialogsHost />
      <AiDialogsHost />
      <TodoDetailsHost />
      <BottomNav />
      <ShortcutsDialog />
      <CommandPalette />
      <GlobalShortcuts />
      <ToastHost />
    </Box>
  );
}
