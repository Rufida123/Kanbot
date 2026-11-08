import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useTranslation } from 'react-i18next';
import { getProgressPercent, getProgressSummary } from '@/features/board/utils/progress';
import type { SprintProgress as SprintProgressValue } from '@/features/board/utils/progress';
import { AnimatedNumber } from '@/shared/components/AnimatedNumber';
import { formatNumber } from '@/shared/utils/formatDate';

type SprintProgressProps = { progress: SprintProgressValue; label: string };

/** Progress bar plus "done/total points" and "done/total todos" (numbers animate on change). */
export function SprintProgress({ progress, label }: SprintProgressProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <LinearProgress
        variant="determinate"
        value={getProgressPercent(progress)}
        aria-label={label}
        aria-valuetext={getProgressSummary(progress)}
        sx={{ height: '0.5rem', borderRadius: 1, '& .MuiLinearProgress-bar': { transitionDuration: '400ms' } }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, color: 'text.secondary', fontSize: '0.8125rem', fontVariantNumeric: 'tabular-nums' }}>
        <span aria-label={t('board:progress.points', { done: progress.donePoints, total: progress.totalPoints })}>
          <AnimatedNumber value={progress.donePoints} />/{formatNumber(progress.totalPoints)} {t('common:unit.points')}
        </span>
        <span aria-label={t('board:progress.todos', { done: progress.doneTodos, total: progress.totalTodos })}>
          <AnimatedNumber value={progress.doneTodos} />/{formatNumber(progress.totalTodos)} {t('common:unit.todos')}
        </span>
      </Box>
    </Box>
  );
}
