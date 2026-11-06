import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ProjectDialogsHost, useRemoveDeletedProjectCaches } from '@/features/projects';
import { TodoDetailsHost } from '@/features/todos';
import { ToastHost } from '@/shared/components/ToastHost';
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
  // Parent of every project observer: see the hook for why the position matters.
  useRemoveDeletedProjectCaches();

  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY, { noSsr: true });
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const { pathname } = useLocation();

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
        <TopBar isDesktop={isDesktop} />
        <Box component="main" sx={{ flex: 1, minWidth: 0, overflow: 'auto', padding: { xs: 2, md: 3 } }}>
          {/* `key`: each page fades in when the route changes. */}
          <Box key={pathname} sx={pageEnterSx}>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </Box>

        </Box>
      </Box>
      <AssistantDrawer />
      <ProjectDialogsHost />
      <TodoDetailsHost />

    </Box>
  );
}
