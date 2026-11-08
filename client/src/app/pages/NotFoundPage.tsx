import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { ErrorState } from '@/shared/components/ErrorState';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <>
      <title>{`${t('common:app.pageNotFound')} · Kanbot`}</title>
      <ErrorState
        isFullPage
        title={t('common:app.pageNotFound')}
        message={t('common:app.pageNotFoundMessage')}
        actions={
          <Button component={RouterLink} to={paths.root} variant="outlined">
            {t('common:app.goToProjects')}
          </Button>
        }
      />
    </>
  );
}
