import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

type AiDisclaimerProps = {
  id?: string;
};

/** "AI can make mistakes. Review before saving. Your text is sent to an AI service." */
export function AiDisclaimer({ id }: AiDisclaimerProps) {
  const { t } = useTranslation();
  return (
    <Typography id={id} variant="caption" color="text.secondary">
      {t('ai:disclaimer')} {t('ai:privacy')}
    </Typography>
  );
}
