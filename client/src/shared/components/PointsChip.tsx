import Box from '@mui/material/Box';
import type { StoryPoints } from '@/shared/types/api';

type PointsChipProps = { points: StoryPoints | null };

/** Story points in a small round badge; "–" when the todo is not estimated. Safe inside a button. */
export function PointsChip({ points }: PointsChipProps) {
  const isEstimated = points !== null;
  return (
    <Box
      component="span"
      role="img"
      aria-label={isEstimated ? `${points} story ${points === 1 ? 'point' : 'points'}` : 'Not estimated'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '1.75rem',
        height: '1.5rem',
        paddingInline: 0.75,
        borderRadius: '0.75rem',
        backgroundColor: 'action.selected',
        color: isEstimated ? 'text.primary' : 'text.secondary',
        fontSize: '0.75rem',
        fontWeight: 'fontWeightMedium',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {isEstimated ? points : '–'}
    </Box>
  );
}
