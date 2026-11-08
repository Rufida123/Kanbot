import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkUpdate } from '@/features/todos/hooks/useBulkUpdate';
import { softDeleteTodos } from '@/features/todos/utils/pendingDeletes';
import { PRIORITY_OPTIONS, TYPE_OPTIONS } from '@/shared/config/constants';
import type { Sprint, Todo } from '@/shared/types/api';
import { formatCount } from '@/shared/utils/formatCount';

type BulkActionsBarProps = {
  projectId: string;
  selected: readonly Todo[];
  sprints: readonly Sprint[] | undefined;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
};

type MenuKind = 'sprint' | 'priority' | 'type';

/** Toolbar of the selection mode: move to sprint, change priority/type, delete, with Undo (enhancement 10). */
export function BulkActionsBar({ projectId, selected, sprints, totalCount, onSelectAll, onClearSelection }: BulkActionsBarProps) {
  const { t } = useTranslation();
  const { run, progress, isRunning } = useBulkUpdate(projectId);
  const [menu, setMenu] = useState<{ kind: MenuKind; anchor: HTMLElement } | null>(null);
  const id = useId();
  const targets = (sprints ?? []).filter((sprint) => sprint.status !== 'completed');
  const hasSelection = selected.length > 0;
  const disabled = !hasSelection || isRunning;

  const open = (kind: MenuKind) => (event: React.MouseEvent<HTMLElement>) => setMenu({ kind, anchor: event.currentTarget });
  const close = () => setMenu(null);

  return (
    <Paper
      variant="outlined"
      role="toolbar"
      aria-label={t('todos:bulk.bar')}
      sx={{ position: 'sticky', top: '0.5rem', zIndex: (theme) => theme.zIndex.appBar - 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, padding: 1, borderColor: 'primary.main' }}
    >
      <Typography variant="body2" role="status" sx={{ paddingInline: 1, fontWeight: 'fontWeightMedium' }}>
        {t('common:count.selected', { count: selected.length })}
      </Typography>
      <Button size="small" onClick={selected.length === totalCount ? onClearSelection : onSelectAll} disabled={isRunning || totalCount === 0}>
        {selected.length === totalCount && totalCount > 0 ? t('todos:bulk.selectNone') : t('todos:bulk.selectAll')}
      </Button>
      <Box sx={{ flex: 1 }} />
      <Tooltip title={targets.length === 0 ? t('todos:bulk.noSprints') : ''}>
        <span>
          <Button size="small" variant="outlined" id={`${id}-sprint`} disabled={disabled || targets.length === 0} aria-haspopup="menu" onClick={open('sprint')}>
            {t('todos:bulk.moveToSprint')}
          </Button>
        </span>
      </Tooltip>
      <Button size="small" variant="outlined" disabled={disabled} aria-haspopup="menu" onClick={open('priority')}>
        {t('todos:bulk.changePriority')}
      </Button>
      <Button size="small" variant="outlined" disabled={disabled} aria-haspopup="menu" onClick={open('type')}>
        {t('todos:bulk.changeType')}
      </Button>
      <Button
        size="small"
        color="error"
        variant="outlined"
        disabled={disabled}
        startIcon={<DeleteOutlinedIcon aria-hidden="true" />}
        onClick={() => {
          softDeleteTodos(selected);
          onClearSelection();
        }}
      >
        {t('todos:bulk.delete')}
      </Button>
      <Menu anchorEl={menu?.anchor ?? null} open={menu !== null} onClose={close}>
        {menu?.kind === 'sprint'
          ? targets.map((sprint) => (
              <MenuItem
                key={sprint.id}
                onClick={() => {
                  close();
                  void run(selected, () => ({ sprintId: sprint.id }), (todo) => ({ sprintId: todo.sprintId })).then(onClearSelection);
                }}
              >
                {sprint.name}
              </MenuItem>
            ))
          : null}
        {menu?.kind === 'priority'
          ? PRIORITY_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  close();
                  void run(selected, () => ({ priority: option.value }), (todo) => ({ priority: todo.priority })).then(onClearSelection);
                }}
              >
                {option.label}
              </MenuItem>
            ))
          : null}
        {menu?.kind === 'type'
          ? TYPE_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  close();
                  void run(selected, () => ({ type: option.value }), (todo) => ({ type: todo.type })).then(onClearSelection);
                }}
              >
                {option.label}
              </MenuItem>
            ))
          : null}
      </Menu>
      {progress ? (
        <Box sx={{ flexBasis: '100%' }} role="status">
          <Typography variant="caption" color="text.secondary">
            {t('todos:bulk.progress', { done: progress.done, total: progress.total })} ({formatCount(progress.total, 'todo')})
          </Typography>
          <LinearProgress variant="determinate" value={(progress.done / Math.max(progress.total, 1)) * 100} aria-label={t('todos:bulk.progress', { done: progress.done, total: progress.total })} />
        </Box>
      ) : null}
    </Paper>
  );
}
