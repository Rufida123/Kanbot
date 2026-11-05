import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { paths } from '@/app/navigation';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

/** Guest-only routes. The router wraps them in `GuestOnly`. */
export const authRoutes: RouteObject[] = [
  { path: paths.login, Component: LoginPage },
  { path: paths.register, Component: RegisterPage },
];
