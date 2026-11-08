import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import { useIsMutating } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { BoardFilterContext } from '@/features/board/context/BoardFilterContext';
import { BurndownChart } from '@/features/board/components/BurndownChart';
import { LabelFilterSelect } from '@/features/todos';
import { FILTER_PARAMS } from '@/app/navigation';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { SprintSummaryDialog } from '@/features/ai';
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
  const { t } = useTranslation();
  return (
    <EmptyState
      headingComponent="h1"
      icon={<ViewKanbanOutlinedIcon fontSize="large" />}
      title={t('board:noSprint.title')}
      message={t('board:noSprint.message')}
      action={
        <Button component={RouterLink} to={paths.project(projectId).backlog} variant="contained">
          {t('board:noSprint.action')}
        </Button>
      }
    />
  );
}

function BoardSkeleton() {
  const { t } = useTranslation();
  return (
    <Box aria-busy="true" aria-label={t('board:view.loading')} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const labelFilter = searchParams.get(FILTER_PARAMS.label);
  const [isBurndownOpen, setIsBurndownOpen] = useState(false);
  const { data, error, isError, isPending, isFetching, refetch } = useBoard(sprintId);
  const isSaving = useIsMutating({ mutationKey: todoMutationKeys.move }) > 0;
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  if (isPending) return <BoardSkeleton />;
  if (isError && data === undefined) {
    if (isNotFoundError(error)) return <NoActiveSprint projectId={projectId} />;
    return (
      <ErrorState
        title={t('board:view.loadError')}
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  // A stale project cache (sprint completed elsewhere) is caught here.
  if (data === undefined || data.sprint.status !== 'active') return <NoActiveSprint projectId={projectId} />;

  const { sprint, columns } = data;
  return (
    <BoardFilterContext.Provider value={labelFilter}>
    <BoardDndProvider projectId={projectId} columns={columns}>
      <title>{t('board:view.titleSuffix', { name: sprint.name })}</title>
      <BoardHeader
        sprint={sprint}
        progress={calculateProgress(columns)}
        isSaving={isSaving}
        onComplete={() => setIsCompleteOpen(true)}
        onSummary={() => setIsSummaryOpen(true)}
        onBurndown={() => setIsBurndownOpen(true)}
        filter={
          <LabelFilterSelect
            projectId={projectId}
            labels={[...new Set(Object.values(columns).flatMap((list) => list.flatMap((todo) => todo.labels)))].sort((a, b) => a.localeCompare(b))}
            value={labelFilter}
            onChange={(label) =>
              setSearchParams((previous) => {
                const next = new URLSearchParams(previous);
                if (label === null) next.delete(FILTER_PARAMS.label);
                else next.set(FILTER_PARAMS.label, label);
                return next;
              }, { replace: true })
            }
          />
        }
      />
      <Box aria-hidden="true" sx={{ height: '0.125rem' }}>
        {isFetching ? <LinearProgress sx={{ height: '0.125rem' }} /> : null}
      </Box>
      <BoardColumns projectId={projectId} columns={columns} />
      {isBurndownOpen ? (
        <Dialog open onClose={() => setIsBurndownOpen(false)} fullWidth maxWidth="md" aria-labelledby="burndown-title">
          <DialogTitle id="burndown-title">{t('board:burndown.title')}</DialogTitle>
          <DialogContent>
            <BurndownChart sprint={sprint} todos={Object.values(columns).flat()} />
          </DialogContent>
          <DialogActions sx={{ padding: 2 }}>
            <Button onClick={() => setIsBurndownOpen(false)}>{t('common:actions.close')}</Button>
          </DialogActions>
        </Dialog>
      ) : null}
      {isSummaryOpen ? (
        <SprintSummaryDialog projectId={projectId} sprint={sprint} onClose={() => setIsSummaryOpen(false)} />
      ) : null}
      {isCompleteOpen ? (
        <CompleteSprintDialog
          projectId={projectId}
          sprint={sprint}
          columns={columns}
          onClose={() => setIsCompleteOpen(false)}
        />
      ) : null}
    </BoardDndProvider>
    </BoardFilterContext.Provider>
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
