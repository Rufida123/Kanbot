import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import { useIsMutating } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { isNotFoundError } from '@/features/board/api/board';
import { BoardColumns } from '@/features/board/components/BoardColumns';
import { BoardDndProvider } from '@/features/board/components/BoardDndProvider';
import { BoardHeader } from '@/features/board/components/BoardHeader';
import { CompleteSprintDialog } from '@/features/board/components/CompleteSprintDialog';
import { BOARD_COLUMN_MIN_WIDTH_REM, BOARD_STATUSES } from '@/features/board/config/layout';
import { useBoard } from '@/features/board/hooks/useBoard';
import { calculateProgress } from '@/features/board/utils/progress';
import { useProject } from '@/features/projects';
import { todoMutationKeys } from '@/features/todos';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

type BoardViewProps = { projectId: string };

function NoActiveSprint({ projectId }: BoardViewProps) {
  return (
    <EmptyState
      headingComponent="h1"
      icon={<ViewKanbanOutlinedIcon fontSize="large" />}
      title="No active sprint"
      message="Start a planned sprint from the backlog to work on it here."
      action={
        <Button component={RouterLink} to={paths.project(projectId).backlog} variant="contained">
          Go to the backlog
        </Button>
      }
    />
  );
}

function BoardSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading board" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rounded" height="5rem" />
      <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
        {BOARD_STATUSES.map((status) => (
          <Skeleton key={status} variant="rounded" height="16rem" sx={{ flex: `1 0 ${BOARD_COLUMN_MIN_WIDTH_REM}rem` }} />
        ))}
      </Box>
    </Box>
  );
}

type ActiveBoardProps = BoardViewProps & { sprintId: string };

function ActiveBoard({ projectId, sprintId }: ActiveBoardProps) {
  const { data, error, isError, isPending, isFetching, refetch } = useBoard(sprintId);
  const isSaving = useIsMutating({ mutationKey: todoMutationKeys.move }) > 0;
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  if (isPending) return <BoardSkeleton />;
  if (isError && data === undefined) {
    if (isNotFoundError(error)) return <NoActiveSprint projectId={projectId} />;
    return (
      <ErrorState
        title="We couldn’t load the board"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  // A stale project cache (sprint completed elsewhere) is caught here.
  if (data === undefined || data.sprint.status !== 'active') return <NoActiveSprint projectId={projectId} />;

  const { sprint, columns } = data;
  return (
    <BoardDndProvider projectId={projectId} columns={columns}>
      <title>{`${sprint.name} · Board · Kanbot`}</title>
      <BoardHeader
        sprint={sprint}
        progress={calculateProgress(columns)}
        isSaving={isSaving}
        onComplete={() => setIsCompleteOpen(true)}
      />
      <Box aria-hidden="true" sx={{ height: '0.125rem' }}>
        {isFetching ? <LinearProgress sx={{ height: '0.125rem' }} /> : null}
      </Box>
      <BoardColumns projectId={projectId} columns={columns} />
      {isCompleteOpen ? (
        <CompleteSprintDialog
          projectId={projectId}
          sprint={sprint}
          columns={columns}
          onClose={() => setIsCompleteOpen(false)}
        />
      ) : null}
    </BoardDndProvider>
  );
}

/**
 * Board of the active sprint (SPR-4). The sprint id comes from the project's counters, so there
 * is no request for the whole sprint list before the board (no waterfall).
 */
export function BoardView({ projectId }: BoardViewProps) {
  const { data: project } = useProject(projectId);
  if (project === undefined) return <BoardSkeleton />;
  const activeSprint = project.stats.activeSprint;
  if (activeSprint === null) return <NoActiveSprint projectId={projectId} />;
  return <ActiveBoard key={activeSprint.id} projectId={projectId} sprintId={activeSprint.id} />;
}
