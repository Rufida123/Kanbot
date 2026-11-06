import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const DEFAULT_SKELETON_COUNT = 6;

type TodoRowSkeletonProps = {
  /** Accessible name, for example "Loading Sprint 2". */
  label?: string;
  count?: number;
};

/** Placeholder rows with the footprint of `TodoRow`, shown while a list loads. */
export function TodoRowSkeleton({ label = 'Loading backlog', count = DEFAULT_SKELETON_COUNT }: TodoRowSkeletonProps) {
  const skeletonKeys = Array.from({ length: count }, (_, index) => `skeleton-${index}`);
  return (
    <Box component="ul" aria-busy="true" aria-label={label} sx={{ listStyle: 'none' }}>
      {skeletonKeys.map((key) => (
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
