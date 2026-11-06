import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import Box from '@mui/material/Box';
import type { ComponentType } from 'react';
import { TYPE_LABELS } from '@/shared/config/constants';
import type { TodoType } from '@/shared/types/api';

const TYPE_ICONS: Record<TodoType, ComponentType<{ fontSize?: 'small'; 'aria-hidden'?: boolean }>> = {
  task: TaskAltOutlinedIcon,
  story: BookmarkBorderIcon,
  bug: BugReportOutlinedIcon,
};

type TypeIconProps = { type: TodoType };

/** The todo type as an icon with an accessible name ("Bug"). Safe inside a button. */
export function TypeIcon({ type }: TypeIconProps) {
  const Icon = TYPE_ICONS[type];
  return (
    <Box
      component="span"
      role="img"
      aria-label={TYPE_LABELS[type]}
      title={TYPE_LABELS[type]}
      sx={{ display: 'inline-flex', color: 'text.secondary' }}
    >
      <Icon fontSize="small" aria-hidden />
    </Box>
  );
}
