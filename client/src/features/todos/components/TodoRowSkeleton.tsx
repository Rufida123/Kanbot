import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const SKELETON_COUNT = 6;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `skeleton-${index}`);

/** Placeholder rows with the footprint of `TodoRow`, shown while the backlog loads. */
export function TodoRowSkeleton() {
  return (
    <Box component="ul" aria-busy="true" aria-label="Loading backlog" sx={{ listStyle: 'none' }}>
      {SKELETON_KEYS.map((key) => (
        <Box
          component="li"
          key={key}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            paddingBlock: 1.5,
            paddingInline: 2,
            borderTop: 1,
            borderColor: 'divider',
            '&:first-of-type': { borderTop: 0 },
          }}
        >
          <Skeleton variant="circular" width="1.25rem" height="1.25rem" />
          <Skeleton variant="text" width="3.5rem" />
          <Skeleton variant="text" sx={{ flex: 1 }} />
          <Skeleton variant="rounded" width="4.5rem" height="1.25rem" />
          <Skeleton variant="rounded" width="1.75rem" height="1.5rem" />
        </Box>
      ))}
    </Box>
  );
}
