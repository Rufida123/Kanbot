import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Logo } from '@/shared/components/Logo';

type AuthLayoutProps = {
  title: string;
  documentTitle: string;
  children: ReactNode;
  /** Link to the other auth page, under the form. */
  footer: ReactNode;
};

/** Centered card shared by the login and register pages (wireframes 01 and 02). */
export function AuthLayout({ title, documentTitle, children, footer }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: { xs: 2, sm: 3 },
      }}
    >
      <title>{`${documentTitle} · Kanbot`}</title>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: '26.5rem',
          padding: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Logo heightRem={4} />
        <Typography component="h1" variant="h2" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>
        {children}
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {footer}
        </Typography>
      </Paper>
    </Box>
  );
}
