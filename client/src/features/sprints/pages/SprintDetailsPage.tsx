import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/shared/components/EmptyState';

/** Placeholder until Sprint 5 builds the real page. */
export default function SprintDetailsPage() {
  const { t } = useTranslation(['sprints']);
  return (
    <>
      <title>{t('sprints:details.title')} · Kanbot</title>
      <EmptyState
        headingComponent="h1"
        icon={<ConstructionOutlinedIcon fontSize="large" />}
        title={t('sprints:details.title')}
        message={t('sprints:details.comingSoon')}
      />
    </>
  );
}
