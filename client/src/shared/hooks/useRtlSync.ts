import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Syncs the document's `dir` and `lang` attributes with i18n language changes.
 * Call this in the root layout or app component.
 */
export function useRtlSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
}
