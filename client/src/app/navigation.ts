/** Single source of truth for URLs. Never write a route as a string literal elsewhere. */
export const paths = {
  root: '/',
  login: '/login',
  register: '/register',
  projects: '/projects',
} as const;

/** Query parameter that carries the page to return to after logging in. */
export const REDIRECT_PARAM = 'redirect';
