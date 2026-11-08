import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Link as RouterLink, useParams } from 'react-router';
import { VelocityChart } from '@/features/board/components/VelocityChart';
import { SprintTemplateDialog } from '@/features/sprints';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { SprintRow } from '@/features/board/components/SprintRow';
import { useSprints } from '@/features/sprints';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const SKELETON_ROWS = ['one', 'two', 'three'] as const;

/** `/projects/:projectId/sprints`: every sprint of the project, in the server's order (SPR-7). */
export default function SprintsPage() {
  const { t } = useTranslation();
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const projectId = useParams()[PROJECT_ID_PARAM];
  const { data: sprints, error, isError, isPending, refetch } = useSprints(projectId);
  if (projectId === undefined) return null;

  const renderBody = () => {
    if (isPending) {
      return (
        <Box aria-busy="true" aria-label={t('board:sprints.loading')} sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 2 }}>
          {SKELETON_ROWS.map((key) => (
            <Skeleton key={key} variant="rounded" height="2.5rem" />
          ))}
        </Box>
      );
    }
    if (isError) {
      return (
        <ErrorState title={t('board:sprints.loadError')} message={getErrorMessage(error)} onRetry={() => void refetch()} />
      );
    }
    if (sprints.length === 0) {
      return (
        <EmptyState
          icon={<HistoryIcon fontSize="large" />}
          title={t('board:sprints.emptyTitle')}
          message={t('board:sprints.emptyMessage')}
          action={
            <Button component={RouterLink} to={paths.project(projectId).backlog} variant="contained">
              {t('board:sprints.goBacklog')}
            </Button>
          }
        />
      );
    }
    return (
      <Box component="ul" aria-label={t('board:sprints.listLabel')} sx={{ listStyle: 'none' }}>
        {sprints.map((sprint) => (
          <SprintRow key={sprint.id} sprint={sprint} />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72rem', width: '100%', marginInline: 'auto' }}>
      <title>{`${t('board:sprints.title')} · Kanbot`}</title>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography component="h1" variant="h2">
          {t('board:sprints.title')}
        </Typography>
        <Button color="inherit" variant="outlined" startIcon={<SettingsOutlinedIcon aria-hidden="true" />} onClick={() => setIsTemplateOpen(true)}>
          {t('board:sprints.template')}
        </Button>
      </Box>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {renderBody()}
      </Paper>
      {sprints !== undefined && sprints.some((sprint) => sprint.status === 'completed') ? (
        <Paper variant="outlined" component="section" aria-labelledby="velocity-heading" sx={{ padding: 2 }}>
          <Typography id="velocity-heading" component="h2" variant="h3">{t('board:velocity.title')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>{t('board:velocity.description')}</Typography>
          <VelocityChart sprints={sprints} />
        </Paper>
      ) : null}
      {isTemplateOpen ? <SprintTemplateDialog onClose={() => setIsTemplateOpen(false)} /> : null}
    </Box>
  );
}
