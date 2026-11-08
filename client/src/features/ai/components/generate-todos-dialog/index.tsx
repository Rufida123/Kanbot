import { zodResolver } from '@hookform/resolvers/zod';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useId, useMemo, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { paths } from '@/app/navigation';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { DraftRow } from '@/features/ai/components/generate-todos-dialog/DraftRow';
import type { DraftChanges } from '@/features/ai/components/generate-todos-dialog/DraftRow';
import {
  GENERATE_DEFAULT_VALUES,
  createGenerateTodosSchema,
  toGenerateRequest,
} from '@/features/ai/components/generate-todos-dialog/config';
import type { GenerateTodosFormValues } from '@/features/ai/components/generate-todos-dialog/config';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { useAiStatus } from '@/features/ai/hooks/useAiStatus';
import { useGenerateTodos } from '@/features/ai/hooks/useGenerateTodos';
import { getCheckedDrafts, hasCheckedDraftWithoutTitle } from '@/features/ai/utils/draftSelectors';
import { mapDraftsToCreateRequests } from '@/features/ai/utils/mapDraftsToCreateRequests';
import { toDrafts } from '@/features/ai/utils/toDrafts';
import type { TodoDraft } from '@/features/ai/utils/toDrafts';
import { useBulkCreateTodos } from '@/features/todos';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { FormTextField } from '@/shared/components/FormTextField';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import type { GenerateTodosRequest } from '@/shared/types/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

type GenerateTodosDialogProps = { projectId: string; onClose: () => void };

/**
 * AI-2: describe a feature, get editable draft todos, then add the checked ones to the backlog.
 * The drafts live in this component's state (never in a store or the query cache) and nothing is
 * saved before "Add N to backlog". Closing or regenerating with drafts asks first. Mounted only
 * while open (`AiDialogsHost`), so every opening starts with a fresh form.
 */
export function GenerateTodosDialog({ projectId, onClose }: GenerateTodosDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createGenerateTodosSchema(t), [t]);
  const id = useId();
  const titleId = `${id}-title`;
  const isSmallScreen = useIsSmallScreen();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: status } = useAiStatus();
  const generateMutation = useGenerateTodos(projectId);
  const bulkMutation = useBulkCreateTodos(projectId);
  const isSavingRef = useRef(false);
  const lastRequestRef = useRef<GenerateTodosRequest | null>(null);
  const [drafts, setDrafts] = useState<TodoDraft[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<GenerateTodosFormValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GenerateTodosFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: GENERATE_DEFAULT_VALUES,
  });
  const promptLength = useWatch({ control, name: 'prompt' }).length;

  const isGenerating = generateMutation.isPending;
  const isSaving = bulkMutation.isPending;
  const isBusy = isGenerating || isSaving;
  const hasDrafts = drafts !== null && drafts.length > 0;
  const checkedCount = drafts === null ? 0 : getCheckedDrafts(drafts).length;
  const isAddDisabled = isBusy || checkedCount === 0 || (drafts !== null && hasCheckedDraftWithoutTitle(drafts));
  const isEmptyResult = drafts !== null && drafts.length === 0;

  const generate = async (request: GenerateTodosRequest) => {
    lastRequestRef.current = request;
    setSaveError(null);
    try {
      const result = await generateMutation.mutateAsync(request);
      setDrafts(toDrafts(result.todos));
    } catch {
      // Shown below from `generateMutation.error`, with a retry button. The old drafts stay.
    }
  };

  // `handleSubmit` runs inside the event handler, not while rendering.
  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void handleSubmit((values) => {
      if (hasDrafts) {
        setPendingValues(values);
        return;
      }
      void generate(toGenerateRequest(values));
    })(event);
  };

  const confirmRegenerate = () => {
    if (pendingValues !== null) void generate(toGenerateRequest(pendingValues));
    setPendingValues(null);
  };

  const requestClose = () => {
    if (isBusy) return;
    if (hasDrafts) {
      setIsDiscardOpen(true);
      return;
    }
    onClose();
  };

  const changeDraft = (draftId: string, changes: DraftChanges) => {
    setDrafts((current) =>
      current === null ? current : current.map((draft) => (draft.id === draftId ? { ...draft, ...changes } : draft)),
    );
  };

  const addToBacklog = async () => {
    if (isSavingRef.current || drafts === null || isAddDisabled) return;
    isSavingRef.current = true;
    setSaveError(null);
    try {
      await bulkMutation.mutateAsync({ projectId, request: { todos: mapDraftsToCreateRequests(drafts) } });
      onClose();
      const backlogPath = paths.project(projectId).backlog;
      if (pathname !== backlogPath) void navigate(backlogPath);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      isSavingRef.current = false;
    }
  };

  const retryGenerate = () => {
    if (lastRequestRef.current !== null) void generate(lastRequestRef.current);
  };

  return (
    <>
      <Dialog
        open
        onClose={requestClose}
        aria-labelledby={titleId}
        aria-busy={isBusy}
        scroll="paper"
        fullWidth
        maxWidth="md"
        fullScreen={isSmallScreen}
      >
        <DialogTitle id={titleId}>{t('ai:generate.title')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
          <Box component="form" noValidate onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormTextField
              label={t('ai:generate.describe')}
              isRequired
              isMultiline
              minRows={3}
              autoFocus
              autoComplete="off"
              isDisabled={isBusy}
              maxLength={AI_LIMITS.promptMax}
              placeholder={t('ai:generate.placeholder')}
              registration={register('prompt')}
              error={errors.prompt}
              hint={status?.mode === 'mock' ? t('ai:generate.mockHint') : undefined}
              counter={`${promptLength}/${AI_LIMITS.promptMax}`}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flex: '0 1 12rem' }}>
                <FormTextField
                  label={t('ai:generate.count')}
                  inputMode="numeric"
                  autoComplete="off"
                  isDisabled={isBusy}
                  maxLength={2}
                  registration={register('count')}
                  error={errors.count}
                  hint={`${AI_LIMITS.countMin}–${AI_LIMITS.countMax}`}
                />
              </Box>
              <Button
                type="submit"
                variant={hasDrafts ? 'outlined' : 'contained'}
                disabled={isBusy}
                sx={{ marginTop: '1.625rem' }}
                startIcon={
                  isGenerating ? (
                    <CircularProgress size={16} color="inherit" aria-hidden="true" />
                  ) : (
                    <AutoAwesomeIcon aria-hidden="true" />
                  )
                }
              >
                {isGenerating ? t('ai:generate.generating') : hasDrafts ? t('ai:generate.again') : t('ai:generate.generate')}
              </Button>
            </Box>
          </Box>
          {generateMutation.isError ? <AiErrorAlert error={generateMutation.error} onRetry={retryGenerate} /> : null}
          {isEmptyResult ? <Alert severity="info">{t('ai:generate.empty')}</Alert> : null}
          {drafts !== null && drafts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography component="h3" variant="subtitle2">
                {t('ai:generate.suggested')}
              </Typography>
              <Box component="ul" aria-label={t('ai:generate.suggestedAria')} sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 0 }}>
                {drafts.map((draft, index) => (
                  <DraftRow key={draft.id} draft={draft} position={index + 1} isDisabled={isBusy} onChange={changeDraft} />
                ))}
              </Box>
            </Box>
          ) : null}
          {saveError === null ? null : <Alert severity="error">{saveError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 14rem', minWidth: 0 }}>
            <AiDisclaimer />
          </Box>
          <Button color="inherit" onClick={requestClose} disabled={isBusy}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={isAddDisabled}
            onClick={() => void addToBacklog()}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined}
          >
            {t('ai:generate.addToBacklog', { count: checkedCount })}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={isDiscardOpen}
        title={t('ai:generate.discardTitle')}
        confirmLabel={t('common:actions.discard')}
        cancelLabel={t('common:actions.keepEditing')}
        isDestructive
        onConfirm={onClose}
        onCancel={() => setIsDiscardOpen(false)}
      >
        {t('ai:generate.discardBody')}
      </ConfirmDialog>
      <ConfirmDialog
        open={pendingValues !== null}
        title={t('ai:generate.replaceTitle')}
        confirmLabel={t('ai:generate.again')}
        cancelLabel={t('ai:generate.keepCurrent')}
        isDestructive
        onConfirm={confirmRegenerate}
        onCancel={() => setPendingValues(null)}
      >
        {t('ai:generate.replaceBody')}
      </ConfirmDialog>
    </>
  );
}
