import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, matchPath, useLocation, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { useUiStore } from '@/shared/stores/uiStore';

export const BOTTOM_NAV_HEIGHT_REM = 3.5;

/** Mobile bottom navigation: Backlog, Board, Sprints, AI (section 4.1 item 7). Hidden from `md` up. */
export function BottomNav() {
  const { t } = useTranslation();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const { pathname } = useLocation();
  const assistantOpen = useUiStore((state) => state.assistantOpen);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  if (projectId === undefined) return null;
  const project = paths.project(projectId);
  const current = [project.backlog, project.board, project.sprints].find(
    (path) => matchPath({ path, end: false }, pathname) !== null,
  );

  return (
    <Paper
      component="nav"
      aria-label={t('common:app.mobileNav')}
      elevation={0}
      square
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation value={assistantOpen ? 'ai' : (current ?? false)} showLabels sx={{ height: `${BOTTOM_NAV_HEIGHT_REM}rem` }}>
        <BottomNavigationAction component={RouterLink} to={project.backlog} value={project.backlog} label={t('common:nav.backlog')} icon={<ListAltIcon />} />
        <BottomNavigationAction component={RouterLink} to={project.board} value={project.board} label={t('common:nav.board')} icon={<ViewKanbanOutlinedIcon />} />
        <BottomNavigationAction component={RouterLink} to={project.sprints} value={project.sprints} label={t('common:nav.sprints')} icon={<SpeedIcon />} />
        <BottomNavigationAction value="ai" label={t('common:nav.ai')} icon={<AutoAwesomeIcon />} onClick={() => setAssistantOpen(!assistantOpen)} />
      </BottomNavigation>
    </Paper>
  );
}
