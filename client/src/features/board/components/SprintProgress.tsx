import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import {
  getProgressPercent,
  getProgressSummary,
} from '@/features/board/utils/progress';
import type { SprintProgress as SprintProgressValue } from '@/features/board/utils/progress';

type SprintProgressProps = { progress: SprintProgressValue; label: string };

/**
 * Progress bar plus both numbers as text. The bar follows points, or the todo ratio when
 * nothing is estimated (never a division by zero). It is a real progressbar with a readable value.
 */
export function SprintProgress({ progress, label }: SprintProgressProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <LinearProgress
        variant="determinate"
        value={getProgressPercent(progress)}
        aria-label={label}
        aria-valuetext={getProgressSummary(progress)}
        sx={{ height: '0.5rem', borderRadius: 1 }}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: 2,
          color: 'text.secondary',
          fontSize: '0.8125rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>
          {progress.donePoints}/{progress.totalPoints} points
        </span>
        <span>
          {progress.doneTodos}/{progress.totalTodos} todos
        </span>
      </Box>
    </Box>
  );
}
