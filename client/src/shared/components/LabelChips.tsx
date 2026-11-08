import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { useLabelColors } from '@/shared/hooks/useLabelColors';
import { isLabelColor, LABEL_HUES } from '@/shared/lib/labelColors';

type LabelChipsProps = {
  labels: readonly string[];
  /** Show at most this many labels, then "+N". Everything is listed in the tooltip text. */
  max?: number;
  /** With a project id the chips use the label colours of that project. */
  projectId?: string;
};

const CHIP_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  maxWidth: '8rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingInline: 0.75,
  borderRadius: '0.25rem',
  border: 1,
  borderColor: 'divider',
  color: 'text.secondary',
  fontSize: '0.75rem',
  lineHeight: 1.5,
} as const;

/** Labels as small tags with a colour dot. Renders nothing for an empty list. Safe inside a button. */
export function LabelChips({ labels, max = 3, projectId }: LabelChipsProps) {
  const { t } = useTranslation();
  const colors = useLabelColors(projectId);
  if (labels.length === 0) return null;
  const visible = labels.slice(0, max);
  const hiddenCount = labels.length - visible.length;
  return (
    <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
      <Box component="span" sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {t('common:labels.prefix')}
      </Box>
      {visible.map((label) => {
        const color = colors[label];
        const hue = isLabelColor(color) ? LABEL_HUES[color] : null;
        return (
          <Box
            component="span"
            key={label}
            title={label}
            dir="auto"
            sx={{ ...CHIP_SX, ...(hue && { borderColor: hue, backgroundColor: `color-mix(in srgb, ${hue} 14%, transparent)`, color: 'text.primary' }) }}
          >
            {hue ? <Box component="span" aria-hidden="true" sx={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: hue, flexShrink: 0 }} /> : null}
            {label}
          </Box>
        );
      })}
      {hiddenCount > 0 ? (
        <Box component="span" title={labels.slice(max).join(', ')} sx={{ ...CHIP_SX, borderStyle: 'dashed' }}>
          +{hiddenCount}
        </Box>
      ) : null}
    </Box>
  );
}
