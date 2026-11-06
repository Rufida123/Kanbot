import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { ProjectActionsMenu } from '@/features/projects/components/ProjectActionsMenu';
import {
  getActiveSprintLabel,
  getBacklogLabel,
  hasActiveSprint,
} from '@/features/projects/utils/getActiveSprintLabel';
import type { ProjectWithStats } from '@/shared/types/api';

const clamp = (lines: number) =>
  ({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden',
    overflowWrap: 'anywhere',
  }) as const;

type ProjectCardProps = { project: ProjectWithStats };

/**
 * The whole card is one link to the project's backlog. The actions menu is a sibling of the
 * link, positioned over the card: a button must not be nested inside an `<a>`.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const isSprintActive = hasActiveSprint(project);
  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        display: 'flex',
        minWidth: 0,
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
        '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
      }}
    >
      <Box
        component={RouterLink}
        to={paths.project(project.id).backlog}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          padding: 2.5,
          // Room for the menu button on the right.
          paddingInlineEnd: 7,
          color: 'inherit',
          textDecoration: 'none',
          borderRadius: 'inherit',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
          <Chip label={project.key} size="small" variant="outlined" />
          <Typography component="h2" variant="h4" sx={clamp(2)}>
            {project.name}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...clamp(2), minHeight: '2.625rem' }}
        >
          {project.description === '' ? 'No description' : project.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, marginTop: 'auto' }}>
          <Chip
            size="small"
            variant="outlined"
            icon={<ListAltIcon aria-hidden="true" />}
            label={getBacklogLabel(project)}
          />
          <Chip
            size="small"
            color={isSprintActive ? 'primary' : 'default'}
            variant={isSprintActive ? 'filled' : 'outlined'}
            icon={
              isSprintActive ? (
                <PlayArrowIcon aria-hidden="true" />
              ) : (
                <PauseIcon aria-hidden="true" />
              )
            }
            label={getActiveSprintLabel(project)}
            sx={{ maxWidth: '100%' }}
          />
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '0.5rem', insetInlineEnd: '0.5rem' }}>
        <ProjectActionsMenu project={project} />
      </Box>
    </Paper>
  );
}
