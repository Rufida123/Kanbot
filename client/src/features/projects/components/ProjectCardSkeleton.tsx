import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';

/** Same footprint as `ProjectCard`, shown while the list loads. */
export function ProjectCardSkeleton() {
  return (
    <Paper variant="outlined" sx={{ padding: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Skeleton variant="rounded" width="3rem" height="1.5rem" />
      <Skeleton variant="text" width="70%" sx={{ fontSize: '1.125rem' }} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="85%" />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rounded" width="6rem" height="1.5rem" />
        <Skeleton variant="rounded" width="7rem" height="1.5rem" />
      </Box>
    </Paper>
  );
}
