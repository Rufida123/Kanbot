import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { SprintProgress } from '@/features/board/components/SprintProgress';
import { formatDaysRemaining, getDaysRemaining, isSprintOverdue } from '@/features/board/utils/sprintDates';
import type { SprintProgress as SprintProgressValue } from '@/features/board/utils/progress';
import type { Sprint } from '@/shared/types/api';
import { formatDateRange } from '@/shared/utils/formatDate';

type BoardHeaderProps = {
  sprint: Sprint;
  progress: SprintProgressValue;
  /** Moves are still being saved: completing now would race with them. */
  isSaving: boolean;
  onComplete: () => void;
  /** Opens the AI summary dialog (AI-4). */
  onSummary: () => void;
};

/** Sticky sprint header: name, goal, dates, days left, progress, the AI summary and Complete buttons. */
export function BoardHeader({ sprint, progress, isSaving, onComplete, onSummary }: BoardHeaderProps) {
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
  const days = getDaysRemaining(sprint.endDate);
  const daysText = formatDaysRemaining(days);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.mobileStepper,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        columnGap: 3,
        rowGap: 1.5,
        paddingBlock: 1.5,
        backgroundColor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flex: '1 1 18rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h1" variant="h2" sx={{ overflowWrap: 'anywhere' }}>
          {sprint.name}
        </Typography>
        {sprint.goal === '' ? null : (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {sprint.goal}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, color: 'text.secondary', fontSize: '0.8125rem' }}>
          {dateRange === '' ? null : <span>{dateRange}</span>}
          {daysText === null ? null : (
            <Box component="span" sx={{ color: isSprintOverdue(days) ? 'warning.main' : 'inherit', fontWeight: 'fontWeightMedium' }}>
              {daysText}
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ flex: '1 1 14rem', maxWidth: '24rem', minWidth: 0 }}>
        <SprintProgress progress={progress} label={`${sprint.name} progress`} />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button variant="outlined" startIcon={<AutoAwesomeIcon aria-hidden="true" />} onClick={onSummary}>
          Summary
        </Button>
        <Tooltip title={isSaving ? 'Saving changes…' : ''}>
          <span>
            <Button variant="contained" startIcon={<CheckIcon aria-hidden="true" />} disabled={isSaving} onClick={onComplete}>
              Complete sprint
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
