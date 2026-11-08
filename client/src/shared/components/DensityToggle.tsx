import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { usePreference } from '@/shared/hooks/usePreference';

/** Compact / comfortable row density (section 3.7). Saved in `preferences.ts`. */
export function DensityToggle() {
  const { t } = useTranslation();
  const [density, setDensity] = usePreference('density');
  const isCompact = density === 'compact';
  const next = isCompact ? 'comfortable' : 'compact';
  const label = `${t('common:density.label')}: ${t(`common:density.${isCompact ? 'compact' : 'comfortable'}`)}`;
  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} aria-pressed={isCompact} onClick={() => setDensity(next)}>
        {isCompact ? <DensitySmallIcon aria-hidden /> : <DensityMediumIcon aria-hidden />}
      </IconButton>
    </Tooltip>
  );
}

/** Vertical padding multiplier for rows and cards. */
export function useDensityScale(): number {
  const [density] = usePreference('density');
  return density === 'compact' ? 0.6 : 1;
}
