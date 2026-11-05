import ListAltIcon from '@mui/icons-material/ListAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink, NavLink, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { UserMenu } from '@/features/auth';
import { ProjectSwitcher } from '@/features/projects';
import { Logo } from '@/shared/components/Logo';
import type { ReactNode } from 'react';

type NavItem = { label: string; icon: ReactNode; getPath: (projectId: string) => string };

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Backlog', icon: <ListAltIcon />, getPath: (id) => paths.project(id).backlog },
  { label: 'Board', icon: <ViewKanbanOutlinedIcon />, getPath: (id) => paths.project(id).board },
  { label: 'Sprints', icon: <SpeedIcon />, getPath: (id) => paths.project(id).sprints },
];

/** Logo, project switcher, project navigation and the user menu. */
export function Sidebar() {
  const projectId = useParams()[PROJECT_ID_PARAM];
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
      <Box component={RouterLink} to={paths.projects} aria-label="Kanbot, all projects" sx={{ display: 'flex' }}>
        <Logo heightRem={2.75} />
      </Box>
      <ProjectSwitcher />
      <Box component="nav" aria-label="Project" sx={{ flex: 1, overflow: 'auto' }}>
        {projectId ? (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.label}
                component={NavLink}
                to={item.getPath(projectId)}
                sx={{
                  borderRadius: 1,
                  '&.active': {
                    backgroundColor: 'action.selected',
                    '& .MuiListItemText-primary': { fontWeight: 'fontWeightMedium' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '2.5rem' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        ) : null}
      </Box>
      <Divider />
      <UserMenu placement="top-start" />
    </Box>
  );
}
