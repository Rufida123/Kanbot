import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { applyFieldErrors } from '@/features/auth';
import { LabelsField } from '@/features/todos/components/LabelsField';
import {
  createTodoFormSchema,
  todoFormFields,
} from '@/features/todos/components/todo-details-dialog/config';
import type { TodoFormValues } from '@/features/todos/components/todo-details-dialog/config';
import { TodoDialogFrame } from '@/features/todos/components/todo-details-dialog/TodoDialogFrame';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { notEstimatedLabel } from '@/features/todos/config/copy';
import { useUpdateTodo } from '@/features/todos/hooks/useUpdateTodo';
import { useTodoDeleteStore } from '@/features/todos/store/todoDeleteStore';
import { getSprintOptions } from '@/features/todos/utils/getSprintOptions';
import { getTodoChanges, hasTodoChanges, toTodoFormValues } from '@/features/todos/utils/getTodoChanges';
import { getTodoLock } from '@/features/todos/utils/getTodoLock';
import { isTodoMovable } from '@/features/todos/utils/isTodoMovable';
import { ApiError } from '@/shared/api/client';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { FormSelectField } from '@/shared/components/FormSelectField';
import { FormTextField } from '@/shared/components/FormTextField';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TypeIcon } from '@/shared/components/TypeIcon';
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  STORY_POINT_VALUES,
  TYPE_LABELS,
  TYPE_OPTIONS,
} from '@/shared/config/constants';
import type { SelectOption } from '@/shared/config/constants';
import { showToast } from '@/shared/stores/toastStore';
import type { Sprint, Todo, TodoPriority, TodoType } from '@/shared/types/api';
import { t as translate } from '@/shared/i18n';
import { formatTimestamp } from '@/shared/utils/formatDate';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const STORY_POINT_OPTIONS: readonly SelectOption[] = [
  {
    value: '',
    get label() {
      return notEstimatedLabel();
    },
  },
  ...STORY_POINT_VALUES.map((points) => ({ value: String(points), label: String(points) })),
];

const COLUMNS_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.6fr) minmax(0, 1fr)' },
  columnGap: 3,
  rowGap: 0.5,
  alignItems: 'start',
} as const;

const COLUMN_SX = { display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 } as const;

type TodoDetailsFormProps = {
  /** The saved todo. Changes are measured against it as it was when the dialog opened. */
  todo: Todo;
  /** `undefined` while the sprint list is loading or failed. */
  sprints: readonly Sprint[] | undefined;
  isSprintsError: boolean;
  isReplacingLoader: boolean;
  onClose: () => void;
};

function getSprintHint(
  sprints: readonly Sprint[] | undefined,
  isSprintsError: boolean,
  isMovable: boolean,
): string | undefined {
  if (sprints === undefined) return isSprintsError ? translate('todos:form.sprintsError') : translate('todos:form.sprintsLoading');
  return isMovable ? undefined : translate('todos:form.completedHint');
}

/**
 * Edit form of one todo (BL-3): partial PATCH with only the changed fields, discard
 * confirmation, server errors under the fields. Mount it once per opened todo.
 * It closes only after a successful save or a confirmed discard.
 */
export function TodoDetailsForm({
  todo,
  sprints,
  isSprintsError,
  isReplacingLoader,
  onClose,
}: TodoDetailsFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createTodoFormSchema(t), [t]);
  // The values the form started from. A later refetch must not turn untouched fields into "changes".
  const [savedTodo] = useState(todo);
  const updateMutation = useUpdateTodo();
  const requestDelete = useTodoDeleteStore((state) => state.request);
  const isSubmittingRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isPending = updateMutation.isPending;

  const initialValues = toTodoFormValues(savedTodo);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  const watched = useWatch({ control });
  const currentValues: TodoFormValues = {
    ...initialValues,
    ...watched,
    labels: watched.labels?.filter((label): label is string => typeof label === 'string') ?? initialValues.labels,
  };
  const changes = getTodoChanges(savedTodo, currentValues);
  const hasUnsavedChanges = hasTodoChanges(changes);

  const isMovable = isTodoMovable(savedTodo, sprints);
  const isSprintListReady = sprints !== undefined;
  const lock = getTodoLock({ todo: savedTodo, sprints, isSprintsError });
  const isReadOnly = lock === 'locked';
  const isLocked = lock !== 'editable';
  const sprintHint = getSprintHint(sprints, isSprintsError, isMovable);

  const requestClose = () => {
    if (isPending) return;
    if (hasUnsavedChanges) {
      setIsDiscardOpen(true);
      return;
    }
    onClose();
  };

  const save = async (formValues: TodoFormValues) => {
    // A ref, not `isPending`: a fast double click can arrive before React re-renders.
    if (isSubmittingRef.current || isLocked) return;
    const saveChanges = getTodoChanges(savedTodo, formValues);
    if (!hasTodoChanges(saveChanges)) return;
    isSubmittingRef.current = true;
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        todoId: savedTodo.id,
        changes: saveChanges,
        previous: { projectId: savedTodo.projectId, sprintId: savedTodo.sprintId },
      });
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        // Rate limit: the text stays in the form, the user can save again in a moment.
        showToast(error.message, 'error');
      } else if (!applyFieldErrors(error, setError, todoFormFields)) {
        setFormError(getErrorMessage(error));
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(save)(event);
  };

  const renderPriority = (option: SelectOption) => <PriorityBadge priority={option.value as TodoPriority} />;
  const renderType = (option: SelectOption) => (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <TypeIcon type={option.value as TodoType} />
      {option.label}
    </Box>
  );

  return (
    <>
      <TodoDialogFrame
        todoKey={savedTodo.key}
        subtitle={t('todos:form.subtitle', { type: TYPE_LABELS[savedTodo.type], date: formatTimestamp(savedTodo.createdAt) })}
        onClose={requestClose}
        onSubmit={submit}
        isBusy={isPending}
        isReplacingLoader={isReplacingLoader}
      >
        <DialogContent dividers sx={{ paddingBlock: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isReadOnly ? <Alert severity="info">{t('todos:form.completedReadOnly')}</Alert> : null}
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <Box sx={COLUMNS_SX}>
              <Box sx={COLUMN_SX}>
                <FormTextField
                  label={t('todos:form.title')}
                  isRequired
                  autoComplete="off"
                  maxLength={TODO_LIMITS.titleMax}
                  registration={register('title')}
                  isDisabled={isLocked}
                  error={errors.title}
                />
                <FormTextField
                  label={t('todos:form.description')}
                  isMultiline
                  minRows={9}
                  autoComplete="off"
                  maxLength={TODO_LIMITS.descriptionMax}
                  registration={register('description')}
                  isDisabled={isLocked}
                  error={errors.description}
                  counter={`${currentValues.description.length}/${TODO_LIMITS.descriptionMax}`}
                />
              </Box>
              <Box sx={COLUMN_SX}>
                <FormSelectField
                  label={t('todos:form.status')}
                  name="status"
                  control={control}
                  options={STATUS_OPTIONS}
                  error={errors.status}
                  isDisabled={!isMovable || isLocked}
                />
                <FormSelectField
                  label={t('todos:form.priority')}
                  name="priority"
                  control={control}
                  options={PRIORITY_OPTIONS}
                  renderOption={renderPriority}
                  error={errors.priority}
                  isDisabled={isLocked}
                />
                <FormSelectField
                  label={t('todos:form.type')}
                  name="type"
                  control={control}
                  options={TYPE_OPTIONS}
                  renderOption={renderType}
                  error={errors.type}
                  isDisabled={isLocked}
                />
                <FormSelectField
                  label={t('todos:form.storyPoints')}
                  name="storyPoints"
                  control={control}
                  options={STORY_POINT_OPTIONS}
                  error={errors.storyPoints}
                  isDisabled={isLocked}
                />
                <FormSelectField
                  label={t('todos:form.sprint')}
                  name="sprintId"
                  control={control}
                  options={getSprintOptions(sprints, savedTodo.sprintId)}
                  error={errors.sprintId}
                  hint={sprintHint}
                  isDisabled={!isMovable || !isSprintListReady || isLocked}
                />
                <LabelsField control={control} error={errors.labels} isDisabled={isLocked} />
                <FormTextField
                  label={t('todos:form.dueDate')}
                  type="date"
                  registration={register('dueDate')}
                  isDisabled={isLocked}
                  error={errors.dueDate}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            color="error"
            variant="outlined"
            disabled={isPending || isLocked}
            onClick={() => {
              // Soft delete with Undo: the dialog closes and the toast offers the way back.
              requestDelete({
                id: savedTodo.id,
                projectId: savedTodo.projectId,
                key: savedTodo.key,
                title: savedTodo.title,
              });
              onClose();
            }}
            sx={{ marginInlineEnd: 'auto' }}
          >
            {t('common:actions.delete')}
          </Button>
          <Button color="inherit" onClick={requestClose} disabled={isPending}>
            {isReadOnly ? t('common:actions.close') : t('common:actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || isLocked || !hasUnsavedChanges}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined}
          >
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </TodoDialogFrame>
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
