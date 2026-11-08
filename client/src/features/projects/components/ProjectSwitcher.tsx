import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { ProjectActionsMenu } from '@/features/projects/components/ProjectActionsMenu';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectDialogStore } from '@/features/projects/store/projectDialogStore';

const ELLIPSIS_SX = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const;

/**
 * Project switcher for the sidebar (PRJ-5). The selected project comes from the URL, never
 * from state, so a reload keeps it. Choosing a project opens its backlog.
 */
export function ProjectSwitcher() {
  const { t } = useTranslation();
  const { data: projects, isPending, isError, refetch } = useProjects();
  const currentProjectId = useParams()[PROJECT_ID_PARAM];
  const navigate = useNavigate();
  const openCreate = useProjectDialogStore((state) => state.openCreate);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;

  if (isPending) return <Skeleton variant="rounded" height="2.5rem" />;

  if (isError) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('projects:switcher.unavailable')}
        </Typography>
        <Button size="small" onClick={() => void refetch()}>
          {t('projects:switcher.retry')}
        </Button>
      </Box>
    );
  }

  if (projects.length === 0) {
    return (
      <Button
        variant="contained"
        startIcon={<AddIcon aria-hidden="true" />}
        onClick={(event) => openCreate(event.currentTarget)}
      >
        {t('projects:switcher.create')}
      </Button>
    );
  }

  const current = projects.find((project) => project.id === currentProjectId);
  const isOpen = anchor !== null;
  const close = () => setAnchor(null);

  const openProject = (projectId: string) => {
    close();
    navigate(paths.project(projectId).backlog);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Button
        id={buttonId}
        color="inherit"
        variant="outlined"
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-label={t('projects:switcher.switchCurrent', { name: current?.name ?? t('projects:switcher.noneSelected') })}
        onClick={(event) => setAnchor(event.currentTarget)}
        startIcon={<FolderOutlinedIcon aria-hidden="true" />}
        endIcon={<ExpandMoreIcon aria-hidden="true" />}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', borderColor: 'divider' }}
      >
        <Box component="span" sx={{ ...ELLIPSIS_SX, flex: 1, textAlign: 'start' }}>
          {current?.name ?? t('projects:switcher.select')}
        </Box>
      </Button>
      {current ? <ProjectActionsMenu project={current} size="small" /> : null}
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={isOpen}
        onClose={close}
        slotProps={{ list: { 'aria-labelledby': buttonId }, paper: { sx: { maxWidth: '18rem' } } }}
      >
        {projects.map((project) => (
          <Tooltip key={project.id} title={project.name} placement="right">
            <MenuItem
              selected={project.id === currentProjectId}
              aria-current={project.id === currentProjectId ? 'true' : undefined}
              onClick={() => openProject(project.id)}
            >
              <Box component="span" sx={ELLIPSIS_SX}>
                {project.name}
              </Box>
            </MenuItem>
          </Tooltip>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            navigate(paths.projects);
          }}
        >
          <ListItemIcon>
            <GridViewIcon fontSize="small" aria-hidden="true" />
          </ListItemIcon>
          {t('projects:switcher.all')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            openCreate(anchor);
            close();
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" aria-hidden="true" />
          </ListItemIcon>
          {t('projects:switcher.new')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
