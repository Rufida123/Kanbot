import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  /** Call to action, for example a "Create" button. */
  action?: ReactNode;
  /** Use `h1` when the state is the main content of a page. */
  headingComponent?: 'h1' | 'h2';
};

/** "Nothing here yet" view: says why it is empty and what to do next. */
export function EmptyState({
  title,
  message,
  icon,
  action,
  headingComponent = 'h2',
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
      }}
    >
      {icon ? (
        <Box aria-hidden="true" sx={{ color: 'text.secondary', display: 'flex' }}>
          {icon}
        </Box>
      ) : null}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: '28rem' }}>
        <Typography component={headingComponent} variant="h3">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}
