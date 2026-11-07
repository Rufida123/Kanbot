import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM, SPRINT_ID_PARAM } from '@/app/navigation';
import { SprintSummaryContent } from '@/features/ai';
import { isNotFoundError } from '@/features/board/api/board';
import { SprintStatusBadge } from '@/features/board/components/SprintStatusBadge';
import { StatTile } from '@/features/board/components/StatTile';
import { formatDaysRemaining, getDaysRemaining } from '@/features/board/utils/sprintDates';
import {
  getCarriedOver,
  getCompletionPercent,
  getSprintStats,
  isSprintCompleted,
} from '@/features/board/utils/sprintStats';
import { useSprint } from '@/features/sprints';
import { TodoList, TodoRowSkeleton, useSprintTodoLists } from '@/features/todos';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import type { Sprint } from '@/shared/types/api';
import { formatDateRange } from '@/shared/utils/formatDate';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const NO_VALUE = '—';

type SprintTodosProps = { projectId: string; sprint: Sprint };

/** The todos that are in the sprint now. Rows of a completed sprint are read-only. */
function SprintTodos({ projectId, sprint }: SprintTodosProps) {
  const [query] = useSprintTodoLists(projectId, [sprint.id]);
  if (query === undefined || query.isPending) return <TodoRowSkeleton label="Loading todos" count={4} />;
  if (query.isError) {
    return (
      <ErrorState title="We couldn’t load the todos" message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
    );
  }
  if (query.data.length === 0) {
    return <EmptyState title="No todos in this sprint" message="Nothing stayed in this sprint." />;
  }
  return <TodoList todos={query.data} label={`${sprint.name} todos`} isReadOnly={isSprintCompleted(sprint)} />;
}

type DetailsProps = { projectId: string; sprint: Sprint };

function SprintDetails({ projectId, sprint }: DetailsProps) {
  const stats = getSprintStats(sprint);
  const carriedOver = getCarriedOver(sprint);
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
  const daysText = sprint.status === 'active' ? formatDaysRemaining(getDaysRemaining(sprint.endDate)) : null;
  const links = paths.project(projectId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
      <title>{`${sprint.name} · Kanbot`}</title>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: 2, rowGap: 1 }}>
        <Box sx={{ flex: '1 1 18rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 1.5 }}>
            <Typography component="h1" variant="h2" sx={{ overflowWrap: 'anywhere' }}>
              {sprint.name}
            </Typography>
            <SprintStatusBadge status={sprint.status} />
          </Box>
          {sprint.goal === '' ? null : (
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {sprint.goal}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {[dateRange, daysText].filter((part) => part !== '' && part !== null).join(' · ')}
          </Typography>
        </Box>
        {sprint.status === 'active' ? (
          <Button component={RouterLink} to={links.board} variant="contained">
            Go to board
          </Button>
        ) : null}
        {sprint.status === 'planned' ? (
          <Button component={RouterLink} to={links.backlog} variant="outlined">
            Go to backlog
          </Button>
        ) : null}
      </Box>
      <Box
        component="section"
        aria-label="Sprint numbers"
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: 2 }}
      >
        <StatTile label="Completed todos" value={`${stats.doneTodos}/${stats.totalTodos}`} />
        <StatTile label="Points done" value={`${stats.donePoints}/${stats.totalPoints}`} />
        <StatTile label="Carried over" value={carriedOver === null ? NO_VALUE : String(carriedOver)} />
        <StatTile label="Completion" value={`${getCompletionPercent(stats)}%`} />
      </Box>
      {sprint.status === 'planned' ? null : (
        <Paper variant="outlined" component="section" aria-labelledby="sprint-summary-heading" sx={{ padding: 2 }}>
          <Typography id="sprint-summary-heading" component="h2" variant="h3" sx={{ marginBottom: 1.5 }}>
            AI summary
          </Typography>
          <SprintSummaryContent projectId={projectId} sprint={sprint} />
        </Paper>
      )}
      <Paper variant="outlined" component="section" aria-labelledby="sprint-todos-heading" sx={{ overflow: 'hidden' }}>
        <Typography id="sprint-todos-heading" component="h2" variant="h3" sx={{ padding: 2 }}>
          Todos
        </Typography>
        <SprintTodos projectId={projectId} sprint={sprint} />
      </Paper>
    </Box>
  );
}

/** `/projects/:projectId/sprints/:sprintId`: the numbers and the todos of one sprint (SPR-7). */
export default function SprintDetailsPage() {
  const params = useParams();
  const projectId = params[PROJECT_ID_PARAM];
  const sprintId = params[SPRINT_ID_PARAM];
  const { data: sprint, error, isError, isPending, refetch } = useSprint(sprintId, projectId);
  if (projectId === undefined) return null;

  const notFound = (
    <ErrorState
      title="Sprint not found"
      message="It may have been deleted, or the link is wrong."
      actions={
        <Button component={RouterLink} to={paths.project(projectId).sprints} variant="outlined">
          Go to sprints
        </Button>
      }
    />
  );

  if (isError && (sprint === undefined || isNotFoundError(error))) {
    if (isNotFoundError(error)) return notFound;
    return <ErrorState title="We couldn’t load this sprint" message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }
  if (isPending || sprint === undefined) {
    return <Skeleton variant="rounded" height="12rem" aria-label="Loading sprint" />;
  }
  // A sprint of another project is not part of this one: same answer as an unknown id.
  if (sprint.projectId !== projectId) return notFound;
  return <SprintDetails projectId={projectId} sprint={sprint} />;
}
