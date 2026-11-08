import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatRelativeTime } from '@/shared/utils/formatDate';

/** "2 hours ago" with the exact time in a tooltip (section 3.10). Follows the active language. */
export function RelativeTime({ value }: { value: string }) {
  const { t } = useTranslation();
  const exact = formatDateTime(value);
  return (
    <Tooltip title={t('common:dates.exact', { time: exact })}>
      <time dateTime={value} tabIndex={0}>
        {formatRelativeTime(value)}
      </time>
    </Tooltip>
  );
}
