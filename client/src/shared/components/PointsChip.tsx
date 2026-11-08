import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import type { StoryPoints } from '@/shared/types/api';

type PointsChipProps = { points: StoryPoints | null };

/** Story points in a small round badge; "–" when the todo is not estimated. Safe inside a button. */
export function PointsChip({ points }: PointsChipProps) {
  const { t } = useTranslation();
  const isEstimated = points !== null;
  return (
    <Box
      component="span"
      role="img"
      aria-label={isEstimated ? t('common:points.aria', { count: points }) : t('common:points.notEstimated')}
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
