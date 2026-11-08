import arAi from './locales/ar/ai.json';
import arAuth from './locales/ar/auth.json';
import arBacklog from './locales/ar/backlog.json';
import arBoard from './locales/ar/board.json';
import arCommon from './locales/ar/common.json';
import arProjects from './locales/ar/projects.json';
import arSprints from './locales/ar/sprints.json';
import arTodos from './locales/ar/todos.json';
import enAi from './locales/en/ai.json';
import enAuth from './locales/en/auth.json';
import enBacklog from './locales/en/backlog.json';
import enBoard from './locales/en/board.json';
import enCommon from './locales/en/common.json';
import enProjects from './locales/en/projects.json';
import enSprints from './locales/en/sprints.json';
import enTodos from './locales/en/todos.json';

export const NAMESPACES = ['common', 'auth', 'projects', 'backlog', 'board', 'sprints', 'todos', 'ai'] as const;

export const resources = {
  en: { common: enCommon, auth: enAuth, projects: enProjects, backlog: enBacklog, board: enBoard, sprints: enSprints, todos: enTodos, ai: enAi },
  ar: { common: arCommon, auth: arAuth, projects: arProjects, backlog: arBacklog, board: arBoard, sprints: arSprints, todos: arTodos, ai: arAi },
} as const;
