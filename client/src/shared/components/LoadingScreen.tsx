import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

type LoadingScreenProps = {
  label?: string;
};

/** Full-page loader. Used while the session is being verified and while a lazy page loads. */
export function LoadingScreen({ label = 'Loading…' }: LoadingScreenProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress aria-hidden="true" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
