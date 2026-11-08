import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import { useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChangeEvent, FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import { paths } from '@/app/navigation';
import { applyFieldErrors } from '@/features/auth';
import { useStartSprint } from '@/features/backlog/hooks/useStartSprint';
import { getActiveSprint, getDefaultEndDate, getStartDialogDates, isSprintStartable } from '@/features/sprints';
import { ApiError } from '@/shared/api/client';
import { FormTextField } from '@/shared/components/FormTextField';
import type { Sprint } from '@/shared/types/api';
import { formatCount } from '@/shared/utils/formatCount';
import { isDateOnly } from '@/shared/utils/formatDate';

function createStartSprintSchema(t: TFunction) {
  return z
    .object({
      startDate: z.string().refine(isDateOnly, t('backlog:start.invalidStart')),
      endDate: z.string().refine(isDateOnly, t('backlog:start.invalidEnd')),
    })
    .refine((values) => values.endDate >= values.startDate, {
      message: t('backlog:start.endBeforeStart'),
      path: ['endDate'],
    });
}

type StartSprintValues = z.infer<ReturnType<typeof createStartSprintSchema>>;

const startFields = ['startDate', 'endDate'] as const;

type StartSprintDialogProps = {
  projectId: string;
  sprint: Sprint;
  /** All sprints of the project: tells whether another one is active. */
  sprints: readonly Sprint[];
  /** Todos in the sprint, for the "no todos" warning. */
  todoCount: number;
  onClose: () => void;
};

/**
 * Start dialog (SPR-3). Dates start from the sprint's planned dates or today and +14 days.
 * The button is disabled with the reason while another sprint is active; a 409 that still
 * comes back from the server is shown as well. Success goes to the board.
 */
export function StartSprintDialog({ projectId, sprint, sprints, todoCount, onClose }: StartSprintDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createStartSprintSchema(t), [t]);
  const id = useId();
  const titleId = `${id}-title`;
  const navigate = useNavigate();
  const startMutation = useStartSprint(projectId);
  const isSubmittingRef = useRef(false);
  // Once the user picks an end date, changing the start date no longer rewrites it.
  const [isEndEdited, setIsEndEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const activeSprint = getActiveSprint(sprints);
  const isStartable = isSprintStartable(sprint, sprints);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<StartSprintValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: getStartDialogDates(sprint),
  });

  const startRegistration = register('startDate', {
    deps: ['endDate'],
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (!isEndEdited && isDateOnly(value)) setValue('endDate', getDefaultEndDate(value));
    },
  });
  const endRegistration = register('endDate', { onChange: () => setIsEndEdited(true) });

  const submit = async (values: StartSprintValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setFormError(null);
    try {
      await startMutation.mutateAsync({ sprintId: sprint.id, request: values });
      onClose();
      void navigate(paths.project(projectId).board);
    } catch (error) {
      if (!applyFieldErrors(error, setError, startFields)) {
        setFormError(error instanceof ApiError ? error.message : t('common:errors.generic'));
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submit)(event);
  };

  const disabledReason = isStartable
    ? null
    : activeSprint === undefined
      ? t('backlog:start.onlyPlanned')
      : t('backlog:start.stillActive', { name: activeSprint.name });

  return (
    <Dialog
      open
      onClose={startMutation.isPending ? undefined : onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="xs"
    >
      <Box component="form" noValidate onSubmit={onSubmit}>
        <DialogTitle id={titleId}>{t('backlog:start.title', { name: sprint.name })}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 1 }}>
          {disabledReason === null ? null : <Alert severity="info">{disabledReason}</Alert>}
          {todoCount === 0 ? <Alert severity="warning">{t('backlog:start.noTodos')}</Alert> : null}
          {formError ? <Alert severity="error">{formError}</Alert> : null}
          <FormTextField label={t('backlog:start.startDate')} type="date" isRequired registration={startRegistration} error={errors.startDate} />
          <FormTextField label={t('backlog:start.endDate')} type="date" isRequired registration={endRegistration} error={errors.endDate} />
          <Box component="p" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            {t('backlog:start.willMove', { todos: formatCount(todoCount, 'todo') })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button color="inherit" onClick={onClose} disabled={startMutation.isPending}>
            {t('common:actions.cancel')}
          </Button>
          <Tooltip title={disabledReason ?? ''}>
            <span>
              <Button
                type="submit"
                variant="contained"
                disabled={!isStartable || startMutation.isPending}
                startIcon={
                  startMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" aria-hidden="true" />
                  ) : undefined
                }
              >
                {t('backlog:sprint.start')}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
