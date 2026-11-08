import { useEndOrigin } from '@/shared/hooks/useMenuOrigin';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useId, useState } from 'react';
import { DropList } from '@/features/backlog/components/DropList';
import { toContainerId } from '@/features/backlog/utils/containerIds';
import { sumStoryPoints, TodoRowSkeleton } from '@/features/todos';
import { SPRINT_STATUS_LABELS } from '@/shared/config/constants';
import { formatCount } from '@/shared/utils/formatCount';
import { formatDateRange } from '@/shared/utils/formatDate';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { Sprint, Todo } from '@/shared/types/api';

type SprintSectionProps = {
  sprint: Sprint;
  /** `undefined` while loading or failed. */
  todos: readonly Todo[] | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onStart: () => void;
  onDelete: () => void;
};

/**
 * One planned sprint above the backlog (SPR-1): a collapsible section with its header, actions
 * and todos. Header actions sit outside the toggle button (a button must not contain buttons).
 * A collapsed section is not a drop target; its todos are moved with the row menus.
 */
export function SprintSection({
  sprint,
  todos,
  isPending,
  error,
  onRetry,
  isExpanded,
  onToggle,
  onEdit,
  onStart,
  onDelete,
}: SprintSectionProps) {
  const { t } = useTranslation();
  const origin = useEndOrigin();
  const id = useId();
  const headingId = `${id}-heading`;
  const regionId = `${id}-region`;
  const menuButtonId = `${id}-menu-button`;
  const menuId = `${id}-menu`;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const todoCount = todos?.length ?? sprint.stats.totalTodos;
  const points = todos === undefined ? sprint.stats.totalPoints : sumStoryPoints(todos);
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate);

  const runMenuAction = (action: () => void) => {
    setMenuAnchor(null);
    action();
  };

  const renderBody = () => {
    if (error !== null && error !== undefined && todos === undefined) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              {t('common:actions.retry')}
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      );
    }
    if (isPending || todos === undefined) {
      return <TodoRowSkeleton label={t('backlog:sprint.loadingSprint', { name: sprint.name })} count={2} />;
    }
    return (
      <DropList
        containerId={toContainerId(sprint.id)}
        todos={todos}
        label={sprint.name}
        isSortable={isExpanded}
        emptyContent={
          <Typography variant="body2" color="text.secondary" sx={{ padding: 2 }}>
            {t('backlog:sprint.empty', { name: sprint.name })}
          </Typography>
        }
      />
    );
  };

  return (
    <Paper variant="outlined" component="section" aria-labelledby={headingId} sx={{ overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingInlineEnd: 1 }}>
        <Typography component="h2" variant="h3" id={headingId} sx={{ flex: 1, minWidth: 0 }}>
          <ButtonBase
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-controls={regionId}
            sx={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-start',
              columnGap: 1.5,
              rowGap: 0.5,
              padding: 1.5,
              textAlign: 'start',
              font: 'inherit',
              transition: (theme) => theme.transitions.create('background-color'),
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <ExpandMoreIcon
              aria-hidden="true"
              sx={{
                transform: isExpanded ? 'none' : 'rotate(-90deg)',
                transition: (theme) => theme.transitions.create('transform'),
              }}
            />
            <Box component="span" dir="auto" sx={{ overflowWrap: 'anywhere' }}>
              {sprint.name}
            </Box>
            <Chip size="small" variant="outlined" label={SPRINT_STATUS_LABELS[sprint.status]} />
            <Typography component="span" variant="body2" color="text.secondary">
              {[dateRange, t('backlog:sprint.summaryLine', { todos: formatCount(todoCount, 'todo'), points: formatCount(points, 'point') })]
                .filter((part) => part !== '')
                .join(' · ')}
            </Typography>
            {sprint.goal === '' ? null : (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ flexBasis: '100%', overflowWrap: 'anywhere', fontWeight: 'fontWeightRegular' }}
              >
                {t('backlog:sprint.goal', { goal: sprint.goal })}
              </Typography>
            )}
          </ButtonBase>
        </Typography>
        <Button variant="outlined" size="small" onClick={onStart} sx={{ whiteSpace: 'nowrap' }}>
          {t('backlog:sprint.start')}
        </Button>
        <Tooltip title={t('backlog:sprint.actions')}>
          <IconButton
            id={menuButtonId}
            size="small"
            aria-label={t('backlog:sprint.actionsFor', { name: sprint.name })}
            aria-haspopup="menu"
            aria-controls={menuAnchor === null ? undefined : menuId}
            aria-expanded={menuAnchor !== null}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVertIcon fontSize="small" aria-hidden="true" />
          </IconButton>
        </Tooltip>
        <Menu
          id={menuId}
          anchorEl={menuAnchor}
          open={menuAnchor !== null}
          onClose={() => setMenuAnchor(null)}
          slotProps={{ list: { 'aria-labelledby': menuButtonId } }}
          anchorOrigin={origin.anchorOrigin}
          transformOrigin={origin.transformOrigin}
        >
          <MenuItem onClick={() => runMenuAction(onEdit)}>{t('backlog:sprint.edit')}</MenuItem>
          <MenuItem onClick={() => runMenuAction(onStart)}>{t('backlog:sprint.start')}</MenuItem>
          <MenuItem onClick={() => runMenuAction(onDelete)}>{t('backlog:sprint.delete')}</MenuItem>
        </Menu>
      </Box>
      <Collapse in={isExpanded} unmountOnExit id={regionId}>
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>{renderBody()}</Box>
      </Collapse>
    </Paper>
  );
}
