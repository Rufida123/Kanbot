import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import Box from '@mui/material/Box';
import type { ComponentType } from 'react';
import { SPRINT_STATUS_LABELS } from '@/shared/config/constants';
import type { SprintStatus } from '@/shared/types/api';

const STATUS_ICONS: Record<SprintStatus, ComponentType<{ fontSize?: 'inherit'; 'aria-hidden'?: boolean }>> = {
  planned: EventOutlinedIcon,
  active: PlayCircleOutlinedIcon,
  completed: CheckCircleOutlinedIcon,
};

const STATUS_COLORS: Record<SprintStatus, string> = {
  planned: 'text.secondary',
  active: 'primary.main',
  completed: 'success.main',
};

/** Icon + text + colour, so the sprint status is never colour-only. */
export function SprintStatusBadge({ status }: { status: SprintStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: STATUS_COLORS[status],
        fontSize: '0.8125rem',
        fontWeight: 'fontWeightMedium',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon fontSize="inherit" aria-hidden />
      {SPRINT_STATUS_LABELS[status]}
    </Box>
  );
}
