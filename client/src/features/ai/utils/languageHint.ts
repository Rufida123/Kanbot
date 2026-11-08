import i18n from '@/shared/i18n';

/**
 * Makes the AI answer in the active language (enhancement: section 2.7). The hint is added to the
 * prompt text on the frontend; the backend is not changed. It is appended AFTER trimming the user's
 * text to `maxLength`, so the length limits of the API still hold.
 */
export function getLanguageHint(language: string = i18n.language): string {
  return language.startsWith('ar') ? 'Answer in Arabic.' : 'Answer in English.';
}

export function withLanguageHint(text: string, maxLength: number, language?: string): string {
  const hint = getLanguageHint(language);
  const room = Math.max(maxLength - hint.length - 2, 0);
  return `${text.slice(0, room)}\n\n${hint}`;
}
