import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import type { ComponentType } from 'react';
import { PRIORITY_LABELS } from '@/shared/config/constants';
import type { TodoPriority } from '@/shared/types/api';

const PRIORITY_ICONS: Record<TodoPriority, ComponentType<{ fontSize?: 'inherit'; 'aria-hidden'?: boolean }>> = {
  low: KeyboardArrowDownIcon,
  medium: RemoveIcon,
  high: KeyboardArrowUpIcon,
  urgent: KeyboardDoubleArrowUpIcon,
};

type PriorityBadgeProps = { priority: TodoPriority };

/** Icon + text, so priority is never signalled by colour alone (NFR-5). Safe inside a button. */
export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const Icon = PRIORITY_ICONS[priority];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        // Palette path from the theme tokens (`palette.priority.*`), never a raw colour.
        color: `priority.${priority}`,
        fontSize: '0.8125rem',
        fontWeight: 'fontWeightMedium',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon fontSize="inherit" aria-hidden />
      {PRIORITY_LABELS[priority]}
    </Box>
  );
}
