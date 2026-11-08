/** Single source of truth for URLs. Never write a route as a string literal elsewhere. */
export const PROJECT_ID_PARAM = 'projectId';
export const SPRINT_ID_PARAM = 'sprintId';

const PROJECTS_PATH = '/projects';

/** Child segments of `/projects/:projectId`, used by the route config. */
export const projectSegments = {
  backlog: 'backlog',
  board: 'board',
  sprints: 'sprints',
  week: 'week',
  sprint: `sprints/:${SPRINT_ID_PARAM}`,
} as const;

export const paths = {
  root: '/',
  login: '/login',
  register: '/register',
  projects: PROJECTS_PATH,
  /** Route pattern for the project layout route. */
  projectPattern: `${PROJECTS_PATH}/:${PROJECT_ID_PARAM}`,
  /** Links for one project. Ids are server-generated UUIDs, so they are URL-safe. */
  project: (projectId: string) => {
    const root = `${PROJECTS_PATH}/${projectId}`;
    return {
      root,
      backlog: `${root}/${projectSegments.backlog}`,
      board: `${root}/${projectSegments.board}`,
      sprints: `${root}/${projectSegments.sprints}`,
      week: `${root}/${projectSegments.week}`,
      sprint: (sprintId: string) => `${root}/${projectSegments.sprints}/${sprintId}`,
    };
  },
} as const;

/** Query parameter that carries the page to return to after logging in. */
export const REDIRECT_PARAM = 'redirect';

/** Query parameter that holds the id of the todo whose details dialog is open. */
export const TODO_PARAM = 'todo';

/** Query parameters of the backlog filters. They share one query string with `TODO_PARAM`. */
export const FILTER_PARAMS = {
  search: 'q',
  priority: 'priority',
  type: 'type',
  label: 'label',
} as const;
