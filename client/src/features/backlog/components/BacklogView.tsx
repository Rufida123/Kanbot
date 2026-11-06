import ChecklistIcon from '@mui/icons-material/Checklist';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';
import { BacklogFilters } from '@/features/backlog/components/BacklogFilters';
import { useBacklogFilters } from '@/features/backlog/hooks/useBacklogFilters';
import { QuickCreate, TodoList, hasTodoFilters, sumStoryPoints, useBacklog } from '@/features/todos';
import { TodoRowSkeleton } from '@/features/todos/components/TodoRowSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { formatCount } from '@/shared/utils/formatCount';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

type BacklogViewProps = { projectId: string };

/** The backlog (BL-1): header totals, filters, the list with its states and quick create. */
export function BacklogView({ projectId }: BacklogViewProps) {
  const filters = useBacklogFilters();
  const quickCreateRef = useRef<HTMLInputElement>(null);
  const { data: todos, error, isPending, isError, isFetching, refetch } = useBacklog(
    projectId,
    filters.appliedFilters,
  );
  const isFiltered = hasTodoFilters(filters.appliedFilters);

  const renderSummary = () => {
    if (todos === undefined) return null;
    const count = formatCount(todos.length, isFiltered ? 'matching todo' : 'todo');
    return `${count} · ${formatCount(sumStoryPoints(todos), 'point')}`;
  };

  const renderList = () => {
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
    if (todos.length > 0) return <TodoList todos={todos} label="Backlog" />;
    if (isFiltered) {
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
      <EmptyState
        icon={<ChecklistIcon fontSize="large" />}
        title="Your backlog is empty"
        message="Add the work you want to do. You can plan it into sprints later."
        // Sprint 6 adds "Generate with AI" next to this button.
        action={
          <Button variant="contained" onClick={() => quickCreateRef.current?.focus()}>
            Create todo
          </Button>
        }
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
      <title>Backlog · Kanbot</title>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2, rowGap: 0.5 }}>
        <Typography component="h1" variant="h2">
          Backlog
        </Typography>
        <Typography variant="body2" color="text.secondary" role="status">
          {renderSummary()}
        </Typography>
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
      {/* Fixed-height slot: the refresh indicator never shifts the content. */}
      <Box sx={{ height: '0.25rem', marginBlock: -0.5 }}>
        {isFetching && !isPending ? <LinearProgress aria-label="Refreshing backlog" /> : null}
      </Box>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {renderList()}
        {isError ? null : <QuickCreate projectId={projectId} inputRef={quickCreateRef} />}
      </Paper>
    </Box>
  );
}
