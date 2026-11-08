import { zodResolver } from '@hookform/resolvers/zod';
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
import { useTranslation } from 'react-i18next';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { applyFieldErrors } from '@/features/auth';
import { SPRINT_LIMITS } from '@/features/sprints/config/limits';
import { useCreateSprint } from '@/features/sprints/hooks/useCreateSprint';
import { useUpdateSprint } from '@/features/sprints/hooks/useUpdateSprint';
import {
  getCreateSprintRequest,
  getSprintChanges,
  hasSprintChanges,
  toSprintFormValues,
} from '@/features/sprints/utils/getSprintChanges';
import type { SprintFormValues } from '@/features/sprints/utils/getSprintChanges';
import { ApiError } from '@/shared/api/client';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { FormTextField } from '@/shared/components/FormTextField';
import type { Sprint } from '@/shared/types/api';
import { createSprintSchemas, sprintFormFields } from './config';
import { getDefaultSprintDates } from '@/features/sprints/utils/getDefaultSprintDates';
import { getSavedSprintTemplate } from '@/features/sprints/utils/sprintTemplate';

const FORM_FIELDS_GAP = 0.5;
const EMPTY_VALUES: SprintFormValues = { name: '', goal: '', startDate: '', endDate: '' };

type SprintFormDialogProps = {
  projectId: string;
  /** Present in edit mode (a planned sprint), absent in create mode. */
  sprint?: Sprint;
  onClose: () => void;
};

/**
 * Create and edit dialog for planned sprints (SPR-1, SPR-2). Mount it only while it is open:
 * every opening then starts with a fresh form. It closes only after a successful save or a
 * confirmed discard. Edit sends only the changed fields.
 */
export function SprintFormDialog({ projectId, sprint, onClose }: SprintFormDialogProps) {
  const { t } = useTranslation();
  const schemas = useMemo(() => createSprintSchemas(t), [t]);
  // A saved sprint template (enhancement 14) pre-fills the dates of a NEW sprint.
  const isPrefilled = sprint === undefined && getSavedSprintTemplate() !== null;
  const isEdit = sprint !== undefined;
  const id = useId();
  const titleId = `${id}-title`;
  const createMutation = useCreateSprint(projectId);
  const updateMutation = useUpdateSprint(projectId);
  const isSubmittingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(isEdit ? schemas.edit : schemas.create),
    mode: 'onTouched',
    defaultValues: sprint ? toSprintFormValues(sprint) : isPrefilled ? { ...EMPTY_VALUES, ...getDefaultSprintDates() } : EMPTY_VALUES,
  });

  const values = useWatch({ control });
  const changes = sprint
    ? getSprintChanges(sprint, {
        name: values.name ?? '',
        goal: values.goal ?? '',
        startDate: values.startDate ?? '',
        endDate: values.endDate ?? '',
      })
    : {};
  const isSaveDisabled = isPending || (isEdit && !hasSprintChanges(changes));

  const requestClose = () => {
    if (isPending) return;
    if (isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    onClose();
  };

  const submit = async (formValues: SprintFormValues) => {
    // A ref, not `isPending`: a fast double click can arrive before React re-renders.
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setFormError(null);
    try {
      if (sprint) {
        await updateMutation.mutateAsync({
          sprintId: sprint.id,
          changes: getSprintChanges(sprint, formValues),
        });
      } else {
        await createMutation.mutateAsync({ projectId, request: getCreateSprintRequest(formValues) });
      }
      onClose();
    } catch (error) {
      if (!applyFieldErrors(error, setError, sprintFormFields)) {
        setFormError(error instanceof ApiError ? error.message : t('common:errors.generic'));
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // `handleSubmit` runs inside the event handler, not while rendering: the ref is only read there.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submit)(event);
  };

  return (
    <>
      <Dialog open onClose={requestClose} aria-labelledby={titleId} fullWidth maxWidth="sm">
        <Box component="form" noValidate onSubmit={onSubmit}>
          <DialogTitle id={titleId}>{isEdit ? t('sprints:form.editTitle') : t('sprints:form.newTitle')}</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: FORM_FIELDS_GAP, paddingTop: 1 }}
          >
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <FormTextField
              label={t('sprints:form.name')}
              isRequired={isEdit}
              autoFocus
              autoComplete="off"
              maxLength={SPRINT_LIMITS.nameMax}
              registration={register('name')}
              error={errors.name}
              hint={isEdit ? undefined : t('sprints:form.nameHint')}
              placeholder={isEdit ? undefined : t('sprints:form.namePlaceholder')}
            />
            <FormTextField
              label={t('sprints:form.goal')}
              isMultiline
              minRows={2}
              autoComplete="off"
              maxLength={SPRINT_LIMITS.goalMax}
              registration={register('goal')}
              error={errors.goal}
              counter={`${values.goal?.length ?? 0}/${SPRINT_LIMITS.goalMax}`}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 12rem' }}>
                <FormTextField
                  label={t('sprints:form.startDate')}
                  type="date"
                  registration={register('startDate', { deps: ['endDate'] })}
                  error={errors.startDate}
                />
              </Box>
              <Box sx={{ flex: '1 1 12rem' }}>
                <FormTextField
                  label={t('sprints:form.endDate')}
                  type="date"
                  registration={register('endDate')}
                  error={errors.endDate}
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {isPrefilled ? t('sprints:form.prefilled') : t('sprints:form.datesHint')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: 2, gap: 1 }}>
            <Button color="inherit" onClick={requestClose} disabled={isPending}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaveDisabled}
              startIcon={
                isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined
              }
            >
              {isEdit ? t('common:actions.save') : t('sprints:form.create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <ConfirmDialog
        open={isDiscardOpen}
        title={t('common:actions.discardTitle')}
        confirmLabel={t('common:actions.discard')}
        cancelLabel={t('common:actions.keepEditing')}
        isDestructive
        onConfirm={onClose}
        onCancel={() => setIsDiscardOpen(false)}
      >
        {t('common:actions.unsavedLost')}
      </ConfirmDialog>
    </>
  );
}
