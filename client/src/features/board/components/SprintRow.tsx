import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { SprintStatusBadge } from '@/features/board/components/SprintStatusBadge';
import { getSprintStats } from '@/features/board/utils/sprintStats';
import type { Sprint } from '@/shared/types/api';
import { formatDateRange } from '@/shared/utils/formatDate';

/** One row of the history list. The whole row is a link to the sprint's details. */
export function SprintRow({ sprint }: { sprint: Sprint }) {
  const { t } = useTranslation();
  const stats = getSprintStats(sprint);
  const dateRange = formatDateRange(sprint.startDate, sprint.endDate);
  return (
    <Box component="li" sx={{ borderTop: 1, borderColor: 'divider', '&:first-of-type': { borderTop: 0 } }}>
      <ButtonBase
        component={RouterLink}
        to={paths.project(sprint.projectId).sprint(sprint.id)}
        sx={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
          columnGap: 2,
          rowGap: 0.5,
          padding: 2,
          textAlign: 'start',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Box component="span" dir="auto" sx={{ flex: '1 1 12rem', minWidth: 0, fontWeight: 'fontWeightMedium', overflowWrap: 'anywhere' }}>
          {sprint.name}
        </Box>
        <SprintStatusBadge status={sprint.status} />
        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {dateRange === '' ? t('common:dates.noDates') : dateRange}
        </Box>
        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
          {t('sprints:points', { done: stats.donePoints, total: stats.totalPoints })}
        </Box>
      </ButtonBase>
    </Box>
  );
}
