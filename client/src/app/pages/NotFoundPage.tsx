import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { ErrorState } from '@/shared/components/ErrorState';

export default function NotFoundPage() {
  return (
    <>
      <title>Page not found · Kanbot</title>
      <ErrorState
        isFullPage
        title="Page not found"
        message="This page doesn’t exist or may have been moved."
        actions={
          <Button component={RouterLink} to={paths.root} variant="outlined">
            Go to projects
          </Button>
        }
      />
    </>
  );
}
