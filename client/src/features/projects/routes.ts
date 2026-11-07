import { createElement, lazy } from 'react';
import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import { paths, projectSegments } from '@/app/navigation';
import { ProjectGuard } from './components/ProjectGuard';

const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const BacklogPage = lazy(() => import('@/features/backlog/pages/BacklogPage'));
const BoardPage = lazy(() => import('@/features/board/pages/BoardPage'));
const SprintsPage = lazy(() => import('@/features/board/pages/SprintsPage'));
const SprintDetailsPage = lazy(() => import('@/features/board/pages/SprintDetailsPage'));

/** Private routes. The router wraps them in `RequireAuth` and `AppShell`. */
export const projectsRoutes: RouteObject[] = [
  { path: paths.projects, Component: ProjectsPage },
  {
    path: paths.projectPattern,
    Component: ProjectGuard,
    children: [
      { index: true, element: createElement(Navigate, { to: projectSegments.backlog, replace: true }) },
      { path: projectSegments.backlog, Component: BacklogPage },
      { path: projectSegments.board, Component: BoardPage },
      { path: projectSegments.sprints, Component: SprintsPage },
      { path: projectSegments.sprint, Component: SprintDetailsPage },
    ],
  },
];
