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
import { useId, useRef, useState } from 'react';
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
import {
  createSprintSchema,
  DATES_HINT,
  editSprintSchema,
  NAME_CREATE_HINT,
  sprintFormFields,
} from './config';

const GENERIC_ERROR = 'Something went wrong. Please try again.';
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
    resolver: zodResolver(isEdit ? editSprintSchema : createSprintSchema),
    mode: 'onTouched',
    defaultValues: sprint ? toSprintFormValues(sprint) : EMPTY_VALUES,
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
        setFormError(error instanceof ApiError ? error.message : GENERIC_ERROR);
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
          <DialogTitle id={titleId}>{isEdit ? 'Edit sprint' : 'New sprint'}</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: FORM_FIELDS_GAP, paddingTop: 1 }}
          >
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <FormTextField
              label="Name"
              isRequired={isEdit}
              autoFocus
              autoComplete="off"
              maxLength={SPRINT_LIMITS.nameMax}
              registration={register('name')}
              error={errors.name}
              hint={isEdit ? undefined : NAME_CREATE_HINT}
              placeholder={isEdit ? undefined : 'Sprint name'}
            />
            <FormTextField
              label="Goal"
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
                  label="Start date"
                  type="date"
                  registration={register('startDate', { deps: ['endDate'] })}
                  error={errors.startDate}
                />
              </Box>
              <Box sx={{ flex: '1 1 12rem' }}>
                <FormTextField
                  label="End date"
                  type="date"
                  registration={register('endDate')}
                  error={errors.endDate}
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {DATES_HINT}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ padding: 2, gap: 1 }}>
            <Button color="inherit" onClick={requestClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaveDisabled}
              startIcon={
                isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined
              }
            >
              {isEdit ? 'Save' : 'Create sprint'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <ConfirmDialog
        open={isDiscardOpen}
        title="Discard changes?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        isDestructive
        onConfirm={onClose}
        onCancel={() => setIsDiscardOpen(false)}
      >
        Your unsaved changes will be lost.
      </ConfirmDialog>
    </>
  );
}
