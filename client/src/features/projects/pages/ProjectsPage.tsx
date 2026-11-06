import AddIcon from '@mui/icons-material/Add';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectCardSkeleton } from '@/features/projects/components/ProjectCardSkeleton';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProjectDialogStore } from '@/features/projects/store/projectDialogStore';
import { ApiError } from '@/shared/api/client';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';

const SKELETON_COUNT = 6;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `skeleton-${index}`);

const GRID_SX = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
  gap: 2,
} as const;

export default function ProjectsPage() {
  const { data: projects, error, isPending, isError, isFetching, refetch } = useProjects();
  const openCreate = useProjectDialogStore((state) => state.openCreate);

  const renderContent = () => {
    if (isPending) {
      return (
        <Box sx={GRID_SX} aria-busy="true" aria-label="Loading projects">
          {SKELETON_KEYS.map((key) => (
            <ProjectCardSkeleton key={key} />
          ))}
        </Box>
      );
    }
    if (isError) {
      return (
        <ErrorState
          title="We couldn’t load your projects"
          message={error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
          onRetry={() => void refetch()}
        />
      );
    }
    if (projects.length === 0) {
      return (
        <EmptyState
          icon={<FolderOpenOutlinedIcon fontSize="large" />}
          title="No projects yet"
          message="A project holds your backlog, sprints and board. Create one to get started."
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon aria-hidden="true" />}
              onClick={(event) => openCreate(event.currentTarget)}
            >
              Create your first project
            </Button>
          }
        />
      );
    }
    return (
      <Box component="ul" sx={{ ...GRID_SX, listStyle: 'none' }}>
        {projects.map((project) => (
          <Box component="li" key={project.id} sx={{ display: 'flex', minWidth: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <ProjectCard project={project} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
      <title>Projects · Kanbot</title>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography component="h1" variant="h2">
          Projects
        </Typography>
        {projects && projects.length > 0 ? (
          <Button
            variant="contained"
            startIcon={<AddIcon aria-hidden="true" />}
            onClick={(event) => openCreate(event.currentTarget)}
          >
            New project
          </Button>
        ) : null}
      </Box>
      {/* Fixed-height slot: the refresh indicator never shifts the content. */}
      <Box sx={{ height: '0.25rem' }}>
        {isFetching && !isPending ? <LinearProgress aria-label="Refreshing projects" /> : null}
      </Box>
      {renderContent()}
    </Box>
  );
}
