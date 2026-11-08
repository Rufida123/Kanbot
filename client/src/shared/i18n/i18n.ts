import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation namespaces
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enProjects from './locales/en/projects.json';
import enBacklog from './locales/en/backlog.json';
import enBoard from './locales/en/board.json';
import enSprints from './locales/en/sprints.json';
import enAi from './locales/en/ai.json';

import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arProjects from './locales/ar/projects.json';
import arBacklog from './locales/ar/backlog.json';
import arBoard from './locales/ar/board.json';
import arSprints from './locales/ar/sprints.json';
import arAi from './locales/ar/ai.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    projects: enProjects,
    backlog: enBacklog,
    board: enBoard,
    sprints: enSprints,
    ai: enAi,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    projects: arProjects,
    backlog: arBacklog,
    board: arBoard,
    sprints: arSprints,
    ai: arAi,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
