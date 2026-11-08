import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

type LoadingScreenProps = {
  label?: string;
};

/** Full-page loader. Used while the session is being verified and while a lazy page loads. */
export function LoadingScreen({ label }: LoadingScreenProps) {
  const { t } = useTranslation();
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
        {label ?? t('common:app.loading')}
      </Typography>
    </Box>
  );
}
