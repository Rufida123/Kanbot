import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { SprintRow } from '@/features/board/components/SprintRow';
import { useSprints } from '@/features/sprints';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const SKELETON_ROWS = ['one', 'two', 'three'] as const;

/** `/projects/:projectId/sprints`: every sprint of the project, in the server's order (SPR-7). */
export default function SprintsPage() {
  const projectId = useParams()[PROJECT_ID_PARAM];
  const { data: sprints, error, isError, isPending, refetch } = useSprints(projectId);
  if (projectId === undefined) return null;

  const renderBody = () => {
    if (isPending) {
      return (
        <Box aria-busy="true" aria-label="Loading sprints" sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 2 }}>
          {SKELETON_ROWS.map((key) => (
            <Skeleton key={key} variant="rounded" height="2.5rem" />
          ))}
        </Box>
      );
    }
    if (isError) {
      return (
        <ErrorState title="We couldn’t load the sprints" message={getErrorMessage(error)} onRetry={() => void refetch()} />
      );
    }
    if (sprints.length === 0) {
      return (
        <EmptyState
          icon={<HistoryIcon fontSize="large" />}
          title="No sprints yet"
          message="Create a sprint in the backlog and start it. It will show up here."
          action={
            <Button component={RouterLink} to={paths.project(projectId).backlog} variant="contained">
              Go to the backlog
            </Button>
          }
        />
      );
    }
    return (
      <Box component="ul" aria-label="Sprints" sx={{ listStyle: 'none' }}>
        {sprints.map((sprint) => (
          <SprintRow key={sprint.id} sprint={sprint} />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
      <title>Sprints · Kanbot</title>
      <Typography component="h1" variant="h2">
        Sprints
      </Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {renderBody()}
      </Paper>
    </Box>
  );
}
