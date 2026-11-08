import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { t } from '@/shared/i18n';
import { RelativeTime } from '@/shared/components/RelativeTime';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { AiMarkdown } from '@/features/ai/components/AiMarkdown';
import { useSprintSummary } from '@/features/ai/hooks/useSprintSummary';
import { VisuallyHidden } from '@/shared/components/VisuallyHidden';
import type { Sprint } from '@/shared/types/api';

type SprintSummaryContentProps = { projectId: string; sprint: Sprint };

function getButtonLabel(isPending: boolean, hasSummary: boolean): string {
  if (isPending) return t('ai:summary.summarizing');
  return hasSummary ? t('ai:summary.regenerate') : t('ai:summary.summarize');
}

/**
 * AI-4: the saved summary of a sprint (from `sprint.summary`, the only source of truth) with its
 * generation date and time, or a "Summarize" button. Planned sprints have no summary (the server
 * answers 409), so they show nothing. The old text stays visible while a new one is generated.
 */
export function SprintSummaryContent({ projectId, sprint }: SprintSummaryContentProps) {
  useTranslation();
  const mutation = useSprintSummary(projectId);
  if (sprint.status === 'planned') return null;

  const { summary } = sprint;
  const request = () => mutation.mutate(sprint.id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {mutation.isError ? <AiErrorAlert error={mutation.error} onRetry={request} /> : null}
      {summary === null ? (
        <Typography variant="body2" color="text.secondary">
          {t('ai:summary.none')}
        </Typography>
      ) : (
        <>
          <AiMarkdown content={summary.content} />
          <Typography variant="caption" color="text.secondary">
            {t('ai:summary.generated', { date: '' })}<RelativeTime value={summary.generatedAt} />
          </Typography>
        </>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant={summary === null ? 'contained' : 'outlined'}
          size="small"
          disabled={mutation.isPending}
          onClick={request}
          startIcon={
            mutation.isPending ? (
              <CircularProgress size={16} color="inherit" aria-hidden="true" />
            ) : (
              <AutoAwesomeIcon aria-hidden="true" />
            )
          }
        >
          {getButtonLabel(mutation.isPending, summary !== null)}
        </Button>
        {mutation.isPending ? (
          <Box role="status">
            <VisuallyHidden>{t('ai:summary.generating')}</VisuallyHidden>
          </Box>
        ) : null}
      </Box>
      <AiDisclaimer />
    </Box>
  );
}
