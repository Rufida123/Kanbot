import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { useAiDialogStore } from '@/features/ai';
import { BacklogDndProvider } from '@/features/backlog/components/BacklogDndProvider';
import { BacklogFilters } from '@/features/backlog/components/BacklogFilters';
import { DeleteSprintDialog } from '@/features/backlog/components/DeleteSprintDialog';
import { DropList } from '@/features/backlog/components/DropList';
import { SprintSection } from '@/features/backlog/components/SprintSection';
import { StartSprintDialog } from '@/features/backlog/components/StartSprintDialog';
import { MoveActionsContext } from '@/features/backlog/context/MoveActionsContext';
import { useBacklogFilters } from '@/features/backlog/hooks/useBacklogFilters';
import { useTodoMoveActions } from '@/features/backlog/hooks/useTodoMoveActions';
import { BACKLOG_CONTAINER_ID, parseContainerId, toContainerId } from '@/features/backlog/utils/containerIds';
import type { ContainerId } from '@/features/backlog/utils/containerIds';
import type { ListSource } from '@/features/backlog/utils/dragLogic';
import { getPlannedSprints, SprintFormDialog, useSprints } from '@/features/sprints';
import {
  BACKLOG_LABEL,
  QuickCreate,
  hasTodoFilters,
  sumStoryPoints,
  useBacklog,
  useSprintTodoLists,
} from '@/features/todos';
import { TodoRowSkeleton } from '@/features/todos/components/TodoRowSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { formatCount } from '@/shared/utils/formatCount';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { Todo } from '@/shared/types/api';

const REORDER_LOCK_REASON = 'Clear filters to reorder the backlog';

/** The sprint dialogs of this page: one at a time, only ids are kept (the sprint comes from the cache). */
type SprintDialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit' | 'start' | 'delete'; sprintId: string };

type BacklogViewProps = { projectId: string };

/**
 * Backlog page: planned sprint sections above the backlog (SPR-1…3), drag and drop between
 * them (BL-5, BL-7), header totals, filters, the list with its states and quick create.
 * It is the composition layer: it imports from `todos` and `sprints`, so those never import
 * each other. Drag state lives in `BacklogDndProvider`, dialog state here, data in React Query.
 */
export function BacklogView({ projectId }: BacklogViewProps) {
  const filters = useBacklogFilters();
  const quickCreateRef = useRef<HTMLInputElement>(null);
  const openGenerateTodos = useAiDialogStore((state) => state.openGenerateTodos);
  const [dialog, setDialog] = useState<SprintDialogState>({ kind: 'none' });
  const [collapsedSprintIds, setCollapsedSprintIds] = useState<ReadonlySet<string>>(new Set());

  const backlogQuery = useBacklog(projectId, filters.appliedFilters);
  const { data: todos, error, isPending, isError, isFetching, isPlaceholderData, refetch } = backlogQuery;
  const sprintsQuery = useSprints(projectId);
  const plannedSprints = getPlannedSprints(sprintsQuery.data);
  const sprintListQueries = useSprintTodoLists(
    projectId,
    plannedSprints.map((sprint) => sprint.id),
  );

  const isFiltered = hasTodoFilters(filters.appliedFilters);
  /** The backlog array is the real list only when no filter narrows it and the data is final. */
  const fullBacklog: readonly Todo[] | null =
    todos !== undefined && !isFiltered && !isPlaceholderData ? todos : null;

  const sprintTodos = new Map<string, readonly Todo[]>();
  plannedSprints.forEach((sprint, index) => {
    const data = sprintListQueries[index]?.data;
    if (data !== undefined) sprintTodos.set(sprint.id, data);
  });

  const getMoveActions = useTodoMoveActions({
    projectId,
    sprints: sprintsQuery.data,
    fullBacklog,
    sprintTodos,
  });

  const dropLists: ListSource[] = [
    ...(fullBacklog === null ? [] : [{ containerId: BACKLOG_CONTAINER_ID, todos: fullBacklog }]),
    ...plannedSprints.flatMap((sprint) => {
      const list = sprintTodos.get(sprint.id);
      return list === undefined || collapsedSprintIds.has(sprint.id)
        ? []
        : [{ containerId: toContainerId(sprint.id), todos: list }];
    }),
  ];

  const getListLabel = (containerId: ContainerId): string => {
    const sprintId = parseContainerId(containerId);
    if (sprintId === null) return BACKLOG_LABEL;
    return plannedSprints.find((sprint) => sprint.id === sprintId)?.name ?? 'Sprint';
  };

  const dialogSprint =
    dialog.kind === 'edit' || dialog.kind === 'start' || dialog.kind === 'delete'
      ? plannedSprints.find((sprint) => sprint.id === dialog.sprintId)
      : undefined;
  const closeDialog = () => setDialog({ kind: 'none' });

  const toggleSprint = (sprintId: string) =>
    setCollapsedSprintIds((previous) => {
      const next = new Set(previous);
      if (next.has(sprintId)) next.delete(sprintId);
      else next.add(sprintId);
      return next;
    });

  const getSprintTodoCount = (sprintId: string): number =>
    sprintTodos.get(sprintId)?.length ??
    plannedSprints.find((sprint) => sprint.id === sprintId)?.stats.totalTodos ??
    0;

  const renderSummary = () => {
    if (todos === undefined) return null;
    const count = formatCount(todos.length, isFiltered ? 'matching todo' : 'todo');
    return `${count} · ${formatCount(sumStoryPoints(todos), 'point')}`;
  };

  const renderSprints = () => {
    if (sprintsQuery.isPending) return <Skeleton variant="rounded" height="3.5rem" aria-label="Loading sprints" />;
    if (sprintsQuery.isError) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void sprintsQuery.refetch()}>
              Try again
            </Button>
          }
        >
          Sprints could not be loaded. {getErrorMessage(sprintsQuery.error)}
        </Alert>
      );
    }
    if (plannedSprints.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No planned sprints. Create one to start planning.
        </Typography>
      );
    }
    return plannedSprints.map((sprint, index) => (
      <SprintSection
        key={sprint.id}
        sprint={sprint}
        todos={sprintListQueries[index]?.data}
        isPending={sprintListQueries[index]?.isPending ?? true}
        error={sprintListQueries[index]?.error}
        onRetry={() => void sprintListQueries[index]?.refetch()}
        isExpanded={!collapsedSprintIds.has(sprint.id)}
        onToggle={() => toggleSprint(sprint.id)}
        onEdit={() => setDialog({ kind: 'edit', sprintId: sprint.id })}
        onStart={() => setDialog({ kind: 'start', sprintId: sprint.id })}
        onDelete={() => setDialog({ kind: 'delete', sprintId: sprint.id })}
      />
    ));
  };

  const renderBacklogList = () => {
    if (isPending) return <TodoRowSkeleton />;
    if (isError) {
      return (
        <ErrorState
          title="We couldn’t load the backlog"
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      );
    }
    if (todos.length === 0 && isFiltered) {
      return (
        <EmptyState
          icon={<SearchOffIcon fontSize="large" />}
          title="No todos match your filters"
          message="Try a different search, or remove a filter."
          action={
            <Button variant="outlined" onClick={filters.clearFilters}>
              Clear filters
            </Button>
          }
        />
      );
    }
    return (
      <DropList
        containerId={BACKLOG_CONTAINER_ID}
        todos={todos}
        label="Backlog"
        isSortable={fullBacklog !== null}
        lockedReason={isFiltered ? REORDER_LOCK_REASON : null}
        emptyContent={
          <EmptyState
            icon={<ChecklistIcon fontSize="large" />}
            title="Your backlog is empty"
            message="Add the work you want to do. You can plan it into sprints later, or drag a todo here."
            action={
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <Button variant="contained" onClick={() => quickCreateRef.current?.focus()}>
                  Create todo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon aria-hidden="true" />}
                  onClick={(event) => openGenerateTodos(event.currentTarget)}
                >
                  Generate with AI
                </Button>
              </Box>
            }
          />
        }
      />
    );
  };

  return (
    <MoveActionsContext.Provider value={getMoveActions}>
      <BacklogDndProvider projectId={projectId} lists={dropLists} getListLabel={getListLabel}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
          <title>Backlog · Kanbot</title>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2, rowGap: 0.5, flex: 1 }}>
              <Typography component="h1" variant="h2">
                Backlog
              </Typography>
              <Typography variant="body2" color="text.secondary" role="status">
                {renderSummary()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon aria-hidden="true" />}
              onClick={() => setDialog({ kind: 'create' })}
            >
              Create sprint
            </Button>
          </Box>
          <Box
            component="section"
            aria-label="Planned sprints"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            {renderSprints()}
          </Box>
          <BacklogFilters
            searchInput={filters.searchInput}
            onSearchChange={filters.setSearchInput}
            priority={filters.priority}
            onPriorityChange={filters.setPriority}
            type={filters.type}
            onTypeChange={filters.setType}
            hasActiveFilters={filters.hasActiveFilters}
            onClear={filters.clearFilters}
          />
          {isFiltered && todos !== undefined && todos.length > 0 ? (
            <Alert severity="info" sx={{ paddingBlock: 0 }}>
              Reordering is off while filters are active. {REORDER_LOCK_REASON}. You can still move todos
              to a sprint from their menu.
            </Alert>
          ) : null}
          {/* Fixed-height slot: the refresh indicator never shifts the content. */}
          <Box sx={{ height: '0.25rem', marginBlock: -0.5 }}>
            {isFetching && !isPending ? <LinearProgress aria-label="Refreshing backlog" /> : null}
          </Box>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {renderBacklogList()}
            {isError ? null : <QuickCreate projectId={projectId} inputRef={quickCreateRef} />}
          </Paper>
        </Box>
      </BacklogDndProvider>
      {dialog.kind === 'create' ? <SprintFormDialog projectId={projectId} onClose={closeDialog} /> : null}
      {dialog.kind === 'edit' && dialogSprint !== undefined ? (
        <SprintFormDialog projectId={projectId} sprint={dialogSprint} onClose={closeDialog} />
      ) : null}
      {dialog.kind === 'start' && dialogSprint !== undefined && sprintsQuery.data !== undefined ? (
        <StartSprintDialog
          projectId={projectId}
          sprint={dialogSprint}
          sprints={sprintsQuery.data}
          todoCount={getSprintTodoCount(dialogSprint.id)}
          onClose={closeDialog}
        />
      ) : null}
      {dialog.kind === 'delete' && dialogSprint !== undefined ? (
        <DeleteSprintDialog
          projectId={projectId}
          sprint={dialogSprint}
          todoCount={getSprintTodoCount(dialogSprint.id)}
          onClose={closeDialog}
        />
      ) : null}
    </MoveActionsContext.Provider>
  );
}
