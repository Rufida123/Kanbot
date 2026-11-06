import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router';
import type { RouteObject } from 'react-router';
import { paths } from '@/app/navigation';
import { authRoutes, GuestOnly, RequireAuth } from '@/features/auth';
import { projectsRoutes } from '@/features/projects';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { AppShell } from '@/shared/layout/AppShell';

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const routes: RouteObject[] = [
  { element: <GuestOnly />, children: authRoutes },
  {
    element: <RequireAuth />,
    children: [
      { path: paths.root, element: <Navigate to={paths.projects} replace /> },
      { element: <AppShell />, children: projectsRoutes },
    ],
  },
  { path: '*', Component: NotFoundPage },
];

export function AppRoutes() {
  const element = useRoutes(routes);
  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
}
