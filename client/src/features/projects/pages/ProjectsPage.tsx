import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { UserMenu } from '@/features/auth';
import { Logo } from '@/shared/components/Logo';

/**
 * PLACEHOLDER (Sprint 1). The real projects list, switcher and app shell arrive in Sprint 2.
 * It exists so login and registration have a page to land on and logout can be used.
 */
export default function ProjectsPage() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <title>Projects · Kanbot</title>
      <Paper
        component="header"
        square
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          paddingInline: 3,
          paddingBlock: 0.5,
          borderInline: 0,
          borderTop: 0,
        }}
      >
        <Logo heightRem={3} />
        <UserMenu />
      </Paper>
      <Box
        component="main"
        sx={{ flex: 1, padding: 3, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}
      >
        <Typography component="h1" variant="h2">
          Projects
        </Typography>
        <Typography color="text.secondary" sx={{ marginTop: 1 }}>
          You are signed in. Your projects will appear here.
        </Typography>
      </Box>
    </Box>
  );
}
