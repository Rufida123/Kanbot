import TranslateIcon from '@mui/icons-material/Translate';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/shared/i18n';
import type { Language } from '@/shared/i18n';

/**
 * Switches between English and Arabic (top bar and auth pages). The button shows the language
 * you will switch TO, written in that language, so it is readable by the people who need it.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const target: Language = i18n.language.startsWith('ar') ? 'en' : 'ar';
  return (
    <Button
      color="inherit"
      size="small"
      startIcon={<TranslateIcon aria-hidden="true" />}
      onClick={() => setLanguage(target)}
      lang={target}
      aria-label={`${t('common:language.switchTo')}: ${t(`common:language.${target}`, { lng: target })}`}
      sx={{ whiteSpace: 'nowrap', minHeight: '2.25rem' }}
    >
      {t(`common:language.${target}`, { lng: target })}
    </Button>
  );
}
