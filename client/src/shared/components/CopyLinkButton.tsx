import LinkIcon from '@mui/icons-material/Link';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/shared/stores/toastStore';

/** Copies the current address (for a todo dialog it contains `?todo=<id>`). */
export function CopyLinkButton({ url }: { url?: string }) {
  const { t } = useTranslation();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url ?? window.location.href);
      showToast(t('common:actions.copied'), 'info');
    } catch {
      showToast(t('common:errors.generic'), 'error');
    }
  };
  return (
    <Tooltip title={t('common:actions.copyLink')}>
      <IconButton aria-label={t('common:actions.copyLink')} onClick={() => void copy()}>
        <LinkIcon aria-hidden="true" />
      </IconButton>
    </Tooltip>
  );
}
