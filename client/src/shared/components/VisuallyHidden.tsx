import Box from '@mui/material/Box';
import type { PropsWithChildren } from 'react';

const HIDDEN_SX = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

/** Text for screen readers only (live-region announcements). */
export function VisuallyHidden({ children }: PropsWithChildren) {
  return (
    <Box component="span" sx={HIDDEN_SX}>
      {children}
    </Box>
  );
}
