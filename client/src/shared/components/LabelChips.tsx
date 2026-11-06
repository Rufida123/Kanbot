import Box from '@mui/material/Box';

type LabelChipsProps = {
  labels: readonly string[];
  /** Show at most this many labels, then "+N". Everything is listed in the tooltip text. */
  max?: number;
};

const CHIP_SX = {
  display: 'inline-block',
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

/** Labels as small outlined tags. Renders nothing for an empty list. Safe inside a button. */
export function LabelChips({ labels, max = 3 }: LabelChipsProps) {
  if (labels.length === 0) return null;
  const visible = labels.slice(0, max);
  const hiddenCount = labels.length - visible.length;
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}
    >
      <Box component="span" sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Labels:
      </Box>
      {visible.map((label) => (
        <Box component="span" key={label} title={label} sx={CHIP_SX}>
          {label}
        </Box>
      ))}
      {hiddenCount > 0 ? (
        <Box component="span" title={labels.slice(max).join(', ')} sx={{ ...CHIP_SX, borderStyle: 'dashed' }}>
          +{hiddenCount}
        </Box>
      ) : null}
    </Box>
  );
}
