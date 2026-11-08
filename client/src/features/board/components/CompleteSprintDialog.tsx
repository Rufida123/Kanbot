import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/app/navigation';
import { AiDisclaimer, useSprintSummary } from '@/features/ai';
import { useCompleteSprint } from '@/features/board/hooks/useCompleteSprint';
import { getUnfinishedCount } from '@/features/board/utils/progress';
import type { BoardColumns } from '@/features/board/utils/progress';
import { getPlannedSprints, useSprints } from '@/features/sprints';
import { backlogLabel } from '@/features/todos';
import { ApiError } from '@/shared/api/client';
import { t } from '@/shared/i18n';
import { showToast } from '@/shared/stores/toastStore';
import { useTranslation } from 'react-i18next';
import type { Sprint } from '@/shared/types/api';
import { formatCount } from '@/shared/utils/formatCount';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const BACKLOG_VALUE = 'backlog';

type CompleteSprintDialogProps = {
  projectId: string;
  sprint: Sprint;
  /** The board as cached: the counts below come from it, so they match what the user sees. */
  columns: BoardColumns;
  onClose: () => void;
};

type DialogError = { message: string; isAlreadyCompleted: boolean };

/** Which request the dialog is waiting for; it cannot be dismissed during either step. */
type SubmitPhase = 'completing' | 'summarizing';

function getSubmitLabel(phase: SubmitPhase | null): string {
  if (phase === 'completing') return t('board:complete.completing');
  return phase === 'summarizing' ? t('board:complete.summarizing') : t('board:complete.confirm');
}

function toDialogError(error: unknown): DialogError {
  return {
    message: getErrorMessage(error),
    isAlreadyCompleted: error instanceof ApiError && error.status === 409,
  };
}

/**
 * Complete-sprint dialog (SPR-6): done / not-done counts, where the unfinished todos go
 * (Backlog by default, or a planned sprint) and a clear outcome text before the button.
 * Success goes to the sprint's details. A 409 (completed in another tab) offers the details
 * page; a destination that is no longer planned keeps the dialog open with the sprints refreshed.
 */
export function CompleteSprintDialog({ projectId, sprint, columns, onClose }: CompleteSprintDialogProps) {
  useTranslation();
  const id = useId();
  const titleId = `${id}-title`;
  const groupLabelId = `${id}-destination`;
  const navigate = useNavigate();
  const completeMutation = useCompleteSprint(projectId);
  const summaryMutation = useSprintSummary(projectId);
  const sprintsQuery = useSprints(projectId);
  const isSubmittingRef = useRef(false);
  const [choice, setChoice] = useState(BACKLOG_VALUE);
  const [error, setError] = useState<DialogError | null>(null);
  const [shouldSummarize, setShouldSummarize] = useState(false);
  const [phase, setPhase] = useState<SubmitPhase | null>(null);

  const doneCount = columns.done.length;
  const unfinishedCount = getUnfinishedCount(columns);
  const plannedSprints = getPlannedSprints(sprintsQuery.data);
  // A destination that disappeared (started or deleted elsewhere) falls back to the backlog.
  const destinationSprint = plannedSprints.find((item) => item.id === choice);
  const moveUnfinishedTo = destinationSprint?.id ?? BACKLOG_VALUE;
  const destinationLabel = destinationSprint?.name ?? backlogLabel();
  const isPending = phase !== null;
  const detailsPath = paths.project(projectId).sprint(sprint.id);

  const submit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setError(null);
    setPhase('completing');
    try {
      await completeMutation.mutateAsync({ sprintId: sprint.id, moveUnfinishedTo });
      if (shouldSummarize) {
        setPhase('summarizing');
        try {
          await summaryMutation.mutateAsync(sprint.id);
        } catch (summaryError) {
          // The sprint is completed either way: go on to its page, where "Summarize" is a click away.
          showToast(t('board:complete.summaryFailed', { message: getErrorMessage(summaryError) }), 'error');
        }
      }
      onClose();
      void navigate(detailsPath);
    } catch (submitError) {
      setError(toDialogError(submitError));
    } finally {
      isSubmittingRef.current = false;
      setPhase(null);
    }
  };

  const showDetails = () => {
    onClose();
    void navigate(detailsPath);
  };

  return (
    <Dialog
      open
      onClose={isPending ? undefined : onClose}
      aria-labelledby={titleId}
      aria-busy={isPending}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId}>{t('board:complete.title', { name: sprint.name })}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, paddingTop: 1 }}>
        {error === null ? null : <Alert severity="error">{error.message}</Alert>}
        <Box component="p" role="status">
          {t('board:complete.counts', { done: doneCount, unfinished: unfinishedCount })}
        </Box>
        {unfinishedCount === 0 ? (
          <Alert severity="success">{t('board:complete.allDoneAlert')}</Alert>
        ) : (
          <>
            <FormControl disabled={isPending}>
              <FormLabel id={groupLabelId}>{t('board:complete.moveTo')}</FormLabel>
              <RadioGroup
                aria-labelledby={groupLabelId}
                value={moveUnfinishedTo}
                onChange={(event) => setChoice(event.target.value)}
              >
                <FormControlLabel value={BACKLOG_VALUE} control={<Radio />} label={backlogLabel()} />
                {plannedSprints.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    value={item.id}
                    control={<Radio />}
                    label={t('board:complete.destinationOption', { name: item.name, todos: formatCount(item.stats.totalTodos, 'todo') })}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {sprintsQuery.isPending ? <Box role="status" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{t('board:complete.loadingPlanned')}</Box> : null}
            {sprintsQuery.isError ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={() => void sprintsQuery.refetch()}>
                    {t('common:actions.retry')}
                  </Button>
                }
              >
                {t('board:complete.plannedError')}
              </Alert>
            ) : null}
            <Box component="p" role="status">
              {t('board:complete.willMove', { todos: formatCount(unfinishedCount, 'unfinishedTodo'), destination: destinationLabel })}
            </Box>
          </>
        )}
        <Box>
          <FormControlLabel
            disabled={isPending}
            control={<Checkbox checked={shouldSummarize} onChange={(event) => setShouldSummarize(event.target.checked)} />}
            label={t('board:complete.generateSummary')}
          />
          <Box sx={{ paddingInlineStart: 4 }}>
            <AiDisclaimer />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button color="inherit" onClick={onClose} disabled={isPending}>
          {t('common:actions.cancel')}
        </Button>
        {error?.isAlreadyCompleted ? (
          <Button variant="contained" onClick={showDetails}>
            {t('board:complete.viewSprint')}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={isPending}
            onClick={() => void submit()}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined}
          >
            {getSubmitLabel(phase)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
