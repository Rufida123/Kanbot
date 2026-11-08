import { useTranslation } from 'react-i18next';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
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

type NavItem = { labelKey: string; icon: ReactNode; getPath: (projectId: string) => string };

const NAV_ITEMS: readonly NavItem[] = [
  { labelKey: 'common:nav.backlog', icon: <ListAltIcon />, getPath: (id) => paths.project(id).backlog },
  { labelKey: 'common:nav.board', icon: <ViewKanbanOutlinedIcon />, getPath: (id) => paths.project(id).board },
  { labelKey: 'common:nav.sprints', icon: <SpeedIcon />, getPath: (id) => paths.project(id).sprints },
  { labelKey: 'common:nav.week', icon: <DateRangeIcon />, getPath: (id) => paths.project(id).week },
];

/** Logo, project switcher, project navigation and the user menu. */
export function Sidebar() {
  const { t } = useTranslation();
  const projectId = useParams()[PROJECT_ID_PARAM];
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
      <Box component={RouterLink} to={paths.projects} aria-label={t('common:app.kanbotAllProjects')} sx={{ display: 'flex' }}>
        <Logo heightRem={2.75} />
      </Box>
      <ProjectSwitcher />
      <Box component="nav" aria-label={t('common:app.projectNav')} sx={{ flex: 1, overflow: 'auto' }}>
        {projectId ? (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.labelKey}
                component={NavLink}
                to={item.getPath(projectId)}
                sx={{
                  borderRadius: 1,
                  position: 'relative',
                  '&.active': {
                    backgroundColor: 'action.selected',
                    // Accent bar: the active page is not shown by background colour alone.
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      insetInlineStart: 0,
                      top: '22%',
                      bottom: '22%',
                      width: '0.1875rem',
                      borderRadius: '0.125rem',
                      backgroundColor: 'primary.main',
                    },

                    '& .MuiListItemText-primary': { fontWeight: 'fontWeightMedium' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '2.5rem' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={t(item.labelKey)} />
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
