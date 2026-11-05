import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { paths } from '@/app/navigation';

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

/** Private routes. The router wraps them in `RequireAuth`. */
export const projectsRoutes: RouteObject[] = [{ path: paths.projects, Component: ProjectsPage }];
