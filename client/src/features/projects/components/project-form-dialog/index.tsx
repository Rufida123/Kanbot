import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useId, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/app/navigation';
import { applyFieldErrors } from '@/features/auth';
import { PROJECT_LIMITS } from '@/features/projects/config/limits';
import { useCreateProject } from '@/features/projects/hooks/useCreateProject';
import { useUpdateProject } from '@/features/projects/hooks/useUpdateProject';
import { getProjectChanges, hasChanges } from '@/features/projects/utils/getProjectChanges';
import type { ProjectFormValues } from '@/features/projects/utils/getProjectChanges';
import { normalizeProjectKey } from '@/features/projects/utils/normalizeProjectKey';
import { ApiError } from '@/shared/api/client';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { FormTextField } from '@/shared/components/FormTextField';
import type { ProjectWithStats } from '@/shared/types/api';
import {
  createProjectSchema,
  editProjectSchema,
  emptyProjectFormValues,
  KEY_CREATE_HINT,
  KEY_EDIT_HINT,
  KEY_TAKEN_MESSAGE,
  projectFormFields,
} from './config';

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const FORM_FIELDS_GAP = 0.5;

type ProjectFormDialogProps = {
  /** Present in edit mode, absent in create mode. */
  project?: ProjectWithStats;
  onClose: () => void;
};

function isKeyConflict(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 409 &&
    error.details.some((detail) => detail.path === 'key')
  );
}

/**
 * Create and edit dialog (PRJ-2, PRJ-3). Mount it only while it is open: every opening then
 * starts with a fresh form. It closes only after a successful save or a confirmed discard.
 */
export function ProjectFormDialog({ project, onClose }: ProjectFormDialogProps) {
  const isEdit = project !== undefined;
  const id = useId();
  const titleId = `${id}-title`;
  const navigate = useNavigate();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const isSubmittingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialValues: ProjectFormValues = project
    ? { name: project.name, key: project.key, description: project.description }
    : emptyProjectFormValues;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(isEdit ? editProjectSchema : createProjectSchema),
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  const values = useWatch({ control });
  const changes = project
    ? getProjectChanges(project, {
        name: values.name ?? '',
        key: values.key ?? '',
        description: values.description ?? '',
      })
    : {};
  const isSaveDisabled = isPending || (isEdit && !hasChanges(changes));

  const requestClose = () => {
    if (isPending) return;
    if (isDirty) {
      setIsDiscardOpen(true);
      return;
    }
    onClose();
  };

  const keyRegistration = register('key', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      // Uppercase and strip non-letters while typing, keeping the caret where the user is.
      const input = event.target;
      const caret = input.selectionStart ?? input.value.length;
      const normalized = normalizeProjectKey(input.value);
      const caretAfter = normalizeProjectKey(input.value.slice(0, caret)).length;
      input.value = normalized;
      input.setSelectionRange(caretAfter, caretAfter);
      setValue('key', normalized, { shouldDirty: true });
    },
  });

  const submit = async (formValues: ProjectFormValues) => {
    // A ref, not `isPending`: a fast double click can arrive before React re-renders.
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setFormError(null);
    try {
      if (project) {
        await updateMutation.mutateAsync({
          projectId: project.id,
          changes: getProjectChanges(project, formValues),
        });
        onClose();
        return;
      }
      const key = formValues.key.trim();
      const created = await createMutation.mutateAsync({
        name: formValues.name.trim(),
        // Never send an empty key: the server would reject it instead of generating one.
        key: key === '' ? undefined : key,
        description: formValues.description.trim(),
      });
      navigate(paths.project(created.id).backlog);
      onClose();
    } catch (error) {
      if (isKeyConflict(error)) {
        setError('key', { type: 'server', message: KEY_TAKEN_MESSAGE }, { shouldFocus: true });
      } else if (!applyFieldErrors(error, setError, projectFormFields)) {
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
          <DialogTitle id={titleId}>{isEdit ? 'Edit project' : 'New project'}</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: FORM_FIELDS_GAP, paddingTop: 1 }}
          >
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <FormTextField
              label="Name"
              isRequired
              autoFocus={!isEdit}
              autoComplete="off"
              maxLength={PROJECT_LIMITS.nameMax}
              registration={register('name')}
              error={errors.name}
            />
            <FormTextField
              label="Key"
              autoComplete="off"
              maxLength={PROJECT_LIMITS.keyMax}
              registration={keyRegistration}
              error={errors.key}
              hint={isEdit ? KEY_EDIT_HINT : KEY_CREATE_HINT}
              placeholder="e.g. KAN"
            />
            <FormTextField
              label="Description"
              isMultiline
              minRows={3}
              autoComplete="off"
              maxLength={PROJECT_LIMITS.descriptionMax}
              registration={register('description')}
              error={errors.description}
              counter={`${values.description?.length ?? 0}/${PROJECT_LIMITS.descriptionMax}`}
            />
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
              {isEdit ? 'Save' : 'Create'}
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
