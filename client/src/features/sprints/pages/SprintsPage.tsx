import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/shared/components/EmptyState';

/** Placeholder until Sprint 4 builds the real page. */
export default function SprintsPage() {
  const { t } = useTranslation(['sprints']);
  return (
    <>
      <title>{t('sprints:title')} · Kanbot</title>
      <EmptyState
        headingComponent="h1"
        icon={<ConstructionOutlinedIcon fontSize="large" />}
        title={t('sprints:title')}
        message={t('sprints:comingSoon')}
      />
    </>
  );
}
