import { AppProviders } from '@/app/components/AppProviders';
import { AppRoutes } from '@/app/router';
import { AuthBootstrap } from '@/features/auth';

export default function App() {
  return (
    <AppProviders>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </AppProviders>
  );
}
