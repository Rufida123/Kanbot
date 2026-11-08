import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getPreference, setPreference } from '@/shared/lib/preferences';
import type { Language } from '@/shared/lib/preferences';
import { resources, NAMESPACES } from './resources';

export const LANGUAGES = ['en', 'ar'] as const satisfies readonly Language[];
export const DEFAULT_LANGUAGE: Language = 'en';
export type { Language };

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language === value);
}

export function getDirection(language: string): 'ltr' | 'rtl' {
  return language.startsWith('ar') ? 'rtl' : 'ltr';
}

/** Saved choice, else the browser language, else English. */
export function detectLanguage(): Language {
  const saved = getPreference('language');
  if (isLanguage(saved)) return saved;
  const browser = typeof navigator === 'undefined' ? '' : (navigator.languages?.[0] ?? navigator.language ?? '');
  return browser.toLowerCase().startsWith('ar') ? 'ar' : DEFAULT_LANGUAGE;
}

/** `<html lang dir>` follows the active language. */
export function applyDocumentLanguage(language: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
  document.documentElement.dir = getDirection(language);
}

void i18next.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  ns: [...NAMESPACES],
  defaultNS: 'common',
  fallbackNS: 'common',
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
});

applyDocumentLanguage(i18next.language);
i18next.on('languageChanged', applyDocumentLanguage);

/** Saves the choice (preferences helper) and switches the UI. */
export function setLanguage(language: Language): void {
  setPreference('language', language);
  void i18next.changeLanguage(language);
}

/** For code that runs outside React (mutation callbacks, utils). Components use `useTranslation`. */
export const t = (key: string, options?: Record<string, unknown>): string => String(i18next.t(key, options as never));

/** Locale for `Intl`. Arabic uses Latin digits by default (README: no Eastern Arabic digits setting). */
export function getLocale(): string {
  return i18next.language.startsWith('ar') ? 'ar-u-nu-latn' : 'en-US';
}

export function isRtl(): boolean {
  return getDirection(i18next.language) === 'rtl';
}

export { NAMESPACES };
export default i18next;
