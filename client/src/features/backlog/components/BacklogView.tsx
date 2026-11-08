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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import { useAiDialogStore } from '@/features/ai';
import { BacklogDndProvider } from '@/features/backlog/components/BacklogDndProvider';
import { BacklogFilters } from '@/features/backlog/components/BacklogFilters';
import { DeleteSprintDialog } from '@/features/backlog/components/DeleteSprintDialog';
import { DropList } from '@/features/backlog/components/DropList';
import { SprintSection } from '@/features/backlog/components/SprintSection';
import { StartSprintDialog } from '@/features/backlog/components/StartSprintDialog';
import { MoveActionsContext } from '@/features/backlog/context/MoveActionsContext';
import { SelectionContext } from '@/features/backlog/context/SelectionContext';
import { BulkActionsBar } from '@/features/backlog/components/BulkActionsBar';
import { useUiStore } from '@/shared/stores/uiStore';
import { useBacklogFilters } from '@/features/backlog/hooks/useBacklogFilters';
import { useTodoMoveActions } from '@/features/backlog/hooks/useTodoMoveActions';
import { BACKLOG_CONTAINER_ID, parseContainerId, toContainerId } from '@/features/backlog/utils/containerIds';
import type { ContainerId } from '@/features/backlog/utils/containerIds';
import type { ListSource } from '@/features/backlog/utils/dragLogic';
import { useProject } from '@/features/projects';
import { getPlannedSprints, SprintFormDialog, useSprints } from '@/features/sprints';
import {
  backlogLabel,
  ExportMenu,
  LabelFilterSelect,
  LabelManagerDialog,
  QuickCreate,
  sprintNameResolver,
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
  const { t } = useTranslation();
  const REORDER_LOCK_REASON = t('backlog:page.reorderLock');
  const filters = useBacklogFilters();
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const quickCreateRef = useRef<HTMLInputElement>(null);
  const openGenerateTodos = useAiDialogStore((state) => state.openGenerateTodos);
  const [dialog, setDialog] = useState<SprintDialogState>({ kind: 'none' });
  const [collapsedSprintIds, setCollapsedSprintIds] = useState<ReadonlySet<string>>(new Set());

  const backlogQuery = useBacklog(projectId, filters.appliedFilters);
  const { data: allTodos, error, isPending, isError, isFetching, isPlaceholderData, refetch } = backlogQuery;
  // Label filter (client side): the server filters by text, priority and type only.
  const todos = useMemo(
    () => (allTodos === undefined || filters.label === null ? allTodos : allTodos.filter((todo) => todo.labels.includes(filters.label ?? ''))),
    [allTodos, filters.label],
  );
  const focusSearchSignal = useUiStore((state) => state.focusSearchSignal);
  useEffect(() => {
    if (focusSearchSignal > 0) document.querySelector<HTMLInputElement>('[data-backlog-search] input')?.focus();
  }, [focusSearchSignal]);
  const sprintsQuery = useSprints(projectId);
  const plannedSprints = getPlannedSprints(sprintsQuery.data);
  const sprintListQueries = useSprintTodoLists(
    projectId,
    plannedSprints.map((sprint) => sprint.id),
  );

  const isFiltered = hasTodoFilters(filters.appliedFilters) || filters.label !== null;
  /** The backlog array is the real list only when no filter narrows it and the data is final. */
  const fullBacklog: readonly Todo[] | null =
    allTodos !== undefined && !isFiltered && !isPlaceholderData ? allTodos : null;

  const sprintTodos = new Map<string, readonly Todo[]>();
  plannedSprints.forEach((sprint, index) => {
    const data = sprintListQueries[index]?.data;
    if (data !== undefined) sprintTodos.set(sprint.id, data);
  });
  // A stable key for the memo below: the Map above is rebuilt on every render.
  const sprintTodosKey = [...sprintTodos].map(([id, list]) => `${id}:${list.map((todo) => `${todo.id}@${todo.updatedAt}`).join(',')}`).join('|');

  const { data: project } = useProject(projectId);
  const projectName = project?.name ?? t('common:app.projectFallback');
  const knownTodos = useMemo(() => {
    const map = new Map<string, Todo>();
    for (const todo of allTodos ?? []) map.set(todo.id, todo);
    for (const list of sprintTodos.values()) for (const todo of list) map.set(todo.id, todo);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTodos, sprintTodosKey]);
  const allLabels = useMemo(
    () => [...new Set([...knownTodos.values()].flatMap((todo) => todo.labels))].sort((a, b) => a.localeCompare(b)),
    [knownTodos],
  );
  const selection = useMemo(
    () => ({
      isActive: isSelecting,
      selectedIds,
      toggle: (todoId: string) =>
        setSelectedIds((previous) => {
          const next = new Set(previous);
          if (next.has(todoId)) next.delete(todoId);
          else next.add(todoId);
          return next;
        }),
    }),
    [isSelecting, selectedIds],
  );
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
    if (sprintId === null) return backlogLabel();
    return plannedSprints.find((sprint) => sprint.id === sprintId)?.name ?? t('backlog:page.sprintFallback');
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
    const count = formatCount(todos.length, isFiltered ? 'matchingTodo' : 'todo');
    return t('backlog:page.summary', { todos: count, points: formatCount(sumStoryPoints(todos), 'point') });
  };

  const renderSprints = () => {
    if (sprintsQuery.isPending) return <Skeleton variant="rounded" height="3.5rem" aria-label={t('backlog:page.loadingSprints')} />;
    if (sprintsQuery.isError) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void sprintsQuery.refetch()}>
              {t('common:actions.retry')}
            </Button>
          }
        >
          {t('backlog:page.sprintsError', { message: getErrorMessage(sprintsQuery.error) })}
        </Alert>
      );
    }
    if (plannedSprints.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {t('backlog:page.noPlanned')}
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
          title={t('backlog:page.loadError')}
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      );
    }
    if (todos === undefined) return null;
    if (todos.length === 0 && isFiltered) {
      return (
        <EmptyState
          icon={<SearchOffIcon fontSize="large" />}
          title={t('backlog:page.noMatchTitle')}
          message={t('backlog:page.noMatchMessage')}
          action={
            <Button variant="outlined" onClick={filters.clearFilters}>
              {t('backlog:page.clearFilters')}
            </Button>
          }
        />
      );
    }
    return (
      <DropList
        containerId={BACKLOG_CONTAINER_ID}
        todos={todos}
        label={t('backlog:page.title')}
        isSortable={fullBacklog !== null}
        lockedReason={isFiltered ? REORDER_LOCK_REASON : null}
        emptyContent={
          <EmptyState
            icon={<ChecklistIcon fontSize="large" />}
            title={t('backlog:page.emptyTitle')}
            message={t('backlog:page.emptyMessage')}
            action={
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <Button variant="contained" onClick={() => quickCreateRef.current?.focus()}>
                  {t('backlog:page.createTodo')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon aria-hidden="true" />}
                  onClick={(event) => openGenerateTodos(event.currentTarget)}
                >
                  {t('backlog:page.generateAi')}
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
      <SelectionContext.Provider value={selection}>
      <BacklogDndProvider projectId={projectId} lists={dropLists} getListLabel={getListLabel}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
          <title>{`${t('backlog:page.title')} · Kanbot`}</title>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2, rowGap: 0.5, flex: 1 }}>
              <Typography component="h1" variant="h2">
                {t('backlog:page.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" role="status">
                {renderSummary()}
              </Typography>
            </Box>
            <ExportMenu
              title={t('todos:export.mdTitleBacklog', { project: projectName })}
              todos={todos}
              context={{ sprintName: sprintNameResolver(sprintsQuery.data) }}
              baseName={`${projectName}-backlog`}
            />
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LabelOutlinedIcon aria-hidden="true" />}
              onClick={() => setIsLabelManagerOpen(true)}
            >
              {t('todos:labelManager.open')}
            </Button>
            <Button
              color="inherit"
              variant={isSelecting ? 'contained' : 'outlined'}
              aria-pressed={isSelecting}
              startIcon={<ChecklistRtlIcon aria-hidden="true" />}
              onClick={() => {
                setIsSelecting((current) => !current);
                setSelectedIds(new Set());
              }}
            >
              {isSelecting ? t('todos:bulk.done') : t('todos:bulk.select')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon aria-hidden="true" />}
              onClick={() => setDialog({ kind: 'create' })}
            >
              {t('backlog:page.createSprint')}
            </Button>
          </Box>
          <Box
            component="section"
            aria-label={t('backlog:page.plannedSprints')}
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
          {allLabels.length > 0 || filters.label !== null ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LabelFilterSelect projectId={projectId} labels={allLabels} value={filters.label} onChange={filters.setLabel} />
            </Box>
          ) : null}
          {isSelecting ? (
            <BulkActionsBar
              projectId={projectId}
              selected={[...selectedIds].map((id) => knownTodos.get(id)).filter((todo): todo is Todo => todo !== undefined)}
              sprints={sprintsQuery.data}
              totalCount={knownTodos.size}
              onSelectAll={() => setSelectedIds(new Set(knownTodos.keys()))}
              onClearSelection={() => setSelectedIds(new Set())}
            />
          ) : null}
          {isFiltered && todos !== undefined && todos.length > 0 ? (
            <Alert severity="info" sx={{ paddingBlock: 0 }}>
              {t('backlog:page.reorderOff', { reason: REORDER_LOCK_REASON })}
            </Alert>
          ) : null}
          {/* Fixed-height slot: the refresh indicator never shifts the content. */}
          <Box sx={{ height: '0.25rem', marginBlock: -0.5 }}>
            {isFetching && !isPending ? <LinearProgress aria-label={t('backlog:page.refreshing')} /> : null}
          </Box>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {renderBacklogList()}
            {isError ? null : <QuickCreate projectId={projectId} inputRef={quickCreateRef} />}
          </Paper>
        </Box>
      </BacklogDndProvider>
      </SelectionContext.Provider>
      {isLabelManagerOpen ? <LabelManagerDialog projectId={projectId} onClose={() => setIsLabelManagerOpen(false)} /> : null}
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
