import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink, Outlet, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { useProject } from '@/features/projects/hooks/useProject';
import { ApiError } from '@/shared/api/client';
import { ErrorState } from '@/shared/components/ErrorState';

/**
 * Layout route of `/projects/:projectId/*`. Shows the pages only for a project that exists
 * (an unknown id, another user's id or a project deleted in another tab is a 404 here).
 */
export function ProjectGuard() {
  const projectId = useParams()[PROJECT_ID_PARAM];
  const { data, error, isError, isPending, refetch } = useProject(projectId);

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <ErrorState
          title="Project not found"
          message="It may have been deleted, or the link is wrong."
          actions={
            <Button component={RouterLink} to={paths.projects} variant="outlined">
              Go to projects
            </Button>
          }
        />
      );
    }
    return (
      <ErrorState
        title="We couldn’t load this project"
        message={error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || data === undefined) {
    return (
      <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress aria-label="Loading project" />
      </Box>
    );
  }

  // `key`: moving between projects never reuses another project's page state.
  return <Outlet key={data.id} />;
}
