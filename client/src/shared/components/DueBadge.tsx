import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { getDueState } from '@/shared/utils/dueDate';
import { formatDateOnly } from '@/shared/utils/formatDate';

type DueBadgeProps = { dueDate: string | null; isDone?: boolean };

/** Due-date indicator: overdue (red), due today (amber), soon/later (neutral). Icon + text, never colour alone. */
export function DueBadge({ dueDate, isDone = false }: DueBadgeProps) {
  const { t } = useTranslation();
  const state = getDueState(dueDate, isDone);
  if (dueDate === null || state === null) return null;
  const date = formatDateOnly(dueDate);
  const text =
    state === 'overdue' ? t('common:dates.dueOverdue', { date }) : state === 'today' ? t('common:dates.dueToday') : t('common:dates.dueOn', { date });
  const Icon = state === 'overdue' ? EventBusyOutlinedIcon : state === 'today' ? TodayOutlinedIcon : EventOutlinedIcon;
  const color = state === 'overdue' ? 'error.main' : state === 'today' ? 'warning.main' : 'text.secondary';
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color, fontSize: '0.75rem', fontWeight: state === 'later' || state === 'soon' ? 'fontWeightRegular' : 'fontWeightMedium', whiteSpace: 'nowrap' }}>
      <Icon fontSize="inherit" aria-hidden />
      {text}
    </Box>
  );
}
