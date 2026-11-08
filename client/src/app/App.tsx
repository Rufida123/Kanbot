import { AppProviders } from '@/app/components/AppProviders';
import { AppRoutes } from '@/app/router';
import { AuthBootstrap } from '@/features/auth';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export default function App() {
  return (
    <AppProviders>
      <ErrorBoundary scope="global">
        <AuthBootstrap>
          <AppRoutes />
        </AuthBootstrap>
      </ErrorBoundary>
    </AppProviders>
  );
}
