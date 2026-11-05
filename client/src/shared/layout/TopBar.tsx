import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { matchPath, useLocation, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { useProject } from '@/features/projects';
import { TOP_BAR_HEIGHT_REM } from '@/shared/layout/layout';
import { useUiStore } from '@/shared/stores/uiStore';

const SECTION_TITLES: Record<string, string> = {
  backlog: 'Backlog',
  board: 'Board',
  sprints: 'Sprints',
};

/** "Projects" outside a project; "<project name> · Backlog" inside one. */
function getPageTitle(pathname: string, projectName: string | undefined): string {
  const match = matchPath({ path: `${paths.projectPattern}/:section/*` }, pathname);
  if (!match) return projectName ?? 'Projects';
  const section = SECTION_TITLES[match.params.section ?? ''];
  return [projectName ?? 'Project', section].filter(Boolean).join(' · ');
}

type TopBarProps = { isDesktop: boolean };

export function TopBar({ isDesktop }: TopBarProps) {
  const projectId = useParams()[PROJECT_ID_PARAM];
  const { data: project } = useProject(projectId);
  const { pathname } = useLocation();
  const assistantOpen = useUiStore((state) => state.assistantOpen);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        // Sticky inside the main column: a fixed bar would cover the sidebar.
        backgroundImage: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: `${TOP_BAR_HEIGHT_REM}rem`, gap: 1 }}>
        {isDesktop ? null : (
          <Tooltip title="Open navigation">
            <IconButton
              edge="start"
              aria-label="Open navigation"
              aria-expanded={isMobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <MenuIcon aria-hidden="true" />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="p" variant="subtitle1" noWrap title={getPageTitle(pathname, project?.name)}>
            {getPageTitle(pathname, project?.name)}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon aria-hidden="true" />}
          aria-haspopup="dialog"
          aria-expanded={assistantOpen}
          onClick={() => setAssistantOpen(!assistantOpen)}
        >
          Ask AI
        </Button>
      </Toolbar>
    </AppBar>
  );
}
