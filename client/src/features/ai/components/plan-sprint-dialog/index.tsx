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
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getSavedSprintTemplate } from '@/features/sprints/utils/sprintTemplate';
import { useId, useMemo, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { paths } from '@/app/navigation';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { AiMarkdown } from '@/features/ai/components/AiMarkdown';
import { GoalField } from '@/features/ai/components/plan-sprint-dialog/GoalField';
import { PlanTodoList } from '@/features/ai/components/plan-sprint-dialog/PlanTodoList';
import {
  PLAN_DEFAULT_VALUES,
  createPlanSprintSchema,
  toPlanRequest,
} from '@/features/ai/components/plan-sprint-dialog/config';
import type { PlanSprintFormValues } from '@/features/ai/components/plan-sprint-dialog/config';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { usePlanSprint } from '@/features/ai/hooks/usePlanSprint';
import { getUnsuggestedTodos, matchPlanTodos } from '@/features/ai/utils/matchPlanTodos';
import { getCheckedTodos, sumCheckedPoints } from '@/features/ai/utils/sumCheckedPoints';
import { useCreateSprint, SPRINT_LIMITS } from '@/features/sprints';
import { buildFullBacklogFilters, invalidateTodoCounters, useBacklog } from '@/features/todos';
import { ApiError } from '@/shared/api/client';
import { ErrorState } from '@/shared/components/ErrorState';
import { FormTextField } from '@/shared/components/FormTextField';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import type { PlanSprintRequest } from '@/shared/types/api';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

type PlanSprintDialogProps = { projectId: string; onClose: () => void };

/** The suggestion as it came back, plus the capacity it was asked for. The user's edits live next to it. */
type Plan = { todoIds: string[]; reasoning: string; capacity: number };

/**
 * AI-3: capacity (+ optional focus) → a suggested plan: an editable goal, the backlog todos with
 * checkboxes, the running total against the capacity and the reasoning. "Create sprint" saves a
 * planned sprint with the checked todos. The backlog is read from the query cache (mounted only
 * while open, so it is only fetched when needed) and the suggested ids are matched against it:
 * a todo that left the backlog meanwhile is skipped. Nothing is saved before the button.
 */
export function PlanSprintDialog({ projectId, onClose }: PlanSprintDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createPlanSprintSchema(t), [t]);
  // A saved sprint template (enhancement 14) pre-fills the capacity.
  const templateCapacity = getSavedSprintTemplate()?.capacity;
  const id = useId();
  const titleId = `${id}-title`;
  const isSmallScreen = useIsSmallScreen();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const backlogQuery = useBacklog(projectId, buildFullBacklogFilters());
  const planMutation = usePlanSprint(projectId);
  const createMutation = useCreateSprint(projectId);
  const isCreatingRef = useRef(false);
  const lastRequestRef = useRef<PlanSprintRequest | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [goal, setGoal] = useState('');
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(new Set());
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PlanSprintFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: templateCapacity === undefined ? PLAN_DEFAULT_VALUES : { ...PLAN_DEFAULT_VALUES, capacity: String(templateCapacity) },
  });
  const focusLength = useWatch({ control, name: 'focus' }).length;

  const backlog = backlogQuery.data;
  const isBacklogEmpty = backlog !== undefined && backlog.length === 0;
  const isGenerating = planMutation.isPending;
  const isCreating = createMutation.isPending;
  const isBusy = isGenerating || isCreating;

  const match = plan === null || backlog === undefined ? null : matchPlanTodos(plan.todoIds, backlog);
  // The suggested todos start checked; the rest of the backlog is listed unchecked, so the user can add more.
  const unsuggestedTodos = match === null || backlog === undefined ? [] : getUnsuggestedTodos(match.todos, backlog);
  const selectableTodos = match === null ? [] : [...match.todos, ...unsuggestedTodos];
  const checkedTodos = getCheckedTodos(selectableTodos, checkedIds);
  const checkedPoints = sumCheckedPoints(selectableTodos, checkedIds);
  const isOverCapacity = plan !== null && checkedPoints > plan.capacity;
  const isCreateDisabled = isBusy || plan === null || checkedTodos.length === 0;

  const requestPlan = async (request: PlanSprintRequest) => {
    lastRequestRef.current = request;
    setCreateError(null);
    try {
      const result = await planMutation.mutateAsync(request);
      setPlan({ todoIds: result.todoIds, reasoning: result.reasoning, capacity: request.capacity });
      setGoal(result.goal.trim().slice(0, SPRINT_LIMITS.goalMax));
      setCheckedIds(new Set(result.todoIds));
    } catch {
      // Shown below from `planMutation.error`, with a retry button. The old plan stays.
    }
  };

  // `handleSubmit` runs inside the event handler, not while rendering.
  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    void handleSubmit((values) => requestPlan(toPlanRequest(values)))(event);
  };

  const retryPlan = () => {
    if (lastRequestRef.current !== null) void requestPlan(lastRequestRef.current);
  };

  const toggleTodo = (todoId: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(todoId)) next.delete(todoId);
      else next.add(todoId);
      return next;
    });
  };

  const requestClose = () => {
    if (!isBusy) onClose();
  };

  const createSprint = async () => {
    if (isCreatingRef.current || isCreateDisabled) return;
    isCreatingRef.current = true;
    setCreateError(null);
    const trimmedGoal = goal.trim();
    try {
      await createMutation.mutateAsync({
        projectId,
        request: { ...(trimmedGoal !== '' && { goal: trimmedGoal }), todoIds: checkedTodos.map((todo) => todo.id) },
      });
      // The hook refreshes the sprints; the todos left the backlog, so their lists and counters too.
      invalidateTodoCounters(queryClient, projectId);
      onClose();
      const backlogPath = paths.project(projectId).backlog;
      if (pathname !== backlogPath) void navigate(backlogPath);
    } catch (error) {
      setCreateError(getErrorMessage(error));
      // A 400 means a todo left the backlog meanwhile: the list shows what is really there now.
      if (error instanceof ApiError && error.status === 400) void backlogQuery.refetch();
    } finally {
      isCreatingRef.current = false;
    }
  };

  const renderBacklogState = () => {
    if (backlogQuery.isPending) return <Skeleton variant="rounded" height="4rem" aria-label={t('ai:planDialog.loadingBacklog')} />;
    if (backlogQuery.isError && backlog === undefined) {
      return (
        <ErrorState
          title={t('ai:planDialog.loadError')}
          message={getErrorMessage(backlogQuery.error)}
          onRetry={() => void backlogQuery.refetch()}
        />
      );
    }
    if (isBacklogEmpty) return <Alert severity="info">{t('ai:plan.backlogEmpty')}</Alert>;
    return null;
  };

  const isFormDisabled = isBusy || backlog === undefined || isBacklogEmpty;
  return (
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
      <DialogTitle id={titleId}>{t('ai:planDialog.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
        {renderBacklogState()}
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '0 1 12rem' }}>
              <FormTextField
                label={t('ai:planDialog.capacity')}
                isRequired
                inputMode="numeric"
                autoFocus
                autoComplete="off"
                isDisabled={isFormDisabled}
                maxLength={3}
                registration={register('capacity')}
                error={errors.capacity}
                hint={`${AI_LIMITS.capacityMin}–${AI_LIMITS.capacityMax}`}
              />
            </Box>
            <Box sx={{ flex: '1 1 16rem' }}>
              <FormTextField
                label={t('ai:planDialog.focus')}
                autoComplete="off"
                isDisabled={isFormDisabled}
                maxLength={AI_LIMITS.focusMax}
                registration={register('focus')}
                error={errors.focus}
                counter={`${focusLength}/${AI_LIMITS.focusMax}`}
              />
            </Box>
          </Box>
          <Box>
            <Button
              type="submit"
              variant={plan === null ? 'contained' : 'outlined'}
              disabled={isFormDisabled}
              startIcon={
                isGenerating ? (
                  <CircularProgress size={16} color="inherit" aria-hidden="true" />
                ) : (
                  <AutoAwesomeIcon aria-hidden="true" />
                )
              }
            >
              {isGenerating ? t('ai:planDialog.planning') : plan === null ? t('ai:planDialog.suggest') : t('ai:planDialog.suggestAgain')}
            </Button>
          </Box>
        </Box>
        {planMutation.isError ? <AiErrorAlert error={planMutation.error} onRetry={retryPlan} /> : null}
        {plan !== null && match !== null ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <GoalField value={goal} isDisabled={isBusy} onChange={setGoal} />
            {match.missingCount > 0 ? (
              <Alert severity="info">
                {t('ai:planDialog.missing', { count: match.missingCount })}
              </Alert>
            ) : null}
            {match.todos.length === 0 ? (
              <Alert severity="warning">{t('ai:planDialog.noneLeft')}</Alert>
            ) : (
              <PlanTodoList
                label={t('ai:planDialog.suggestedTodos')}
                todos={match.todos}
                checkedIds={checkedIds}
                isDisabled={isBusy}
                onToggle={toggleTodo}
              />
            )}
            {unsuggestedTodos.length === 0 ? null : (
              <PlanTodoList
                label={t('ai:planDialog.otherTodos')}
                heading={t('ai:planDialog.otherHeading')}
                todos={unsuggestedTodos}
                checkedIds={checkedIds}
                isDisabled={isBusy}
                onToggle={toggleTodo}
              />
            )}
            {plan.reasoning.trim() === '' ? null : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography component="h3" variant="subtitle2">
                  {t('ai:planDialog.why')}
                </Typography>
                <AiMarkdown content={plan.reasoning} />
              </Box>
            )}
          </Box>
        ) : null}
        {createError === null ? null : <Alert severity="error">{createError}</Alert>}
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 14rem', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {plan === null ? null : (
            <Typography
              role="status"
              variant="body2"
              sx={{ fontWeight: 'fontWeightMedium', color: isOverCapacity ? 'warning.main' : 'text.primary' }}
            >
              {t('ai:planDialog.pointsOf', { checked: checkedPoints, capacity: plan.capacity })}
              {isOverCapacity ? t('ai:planDialog.overCapacity', { over: checkedPoints - plan.capacity }) : ''}
            </Typography>
          )}
          <AiDisclaimer />
        </Box>
        <Button color="inherit" onClick={requestClose} disabled={isBusy}>
          {t('common:actions.cancel')}
        </Button>
        <Button
          variant="contained"
          disabled={isCreateDisabled}
          onClick={() => void createSprint()}
          startIcon={isCreating ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : undefined}
        >
          {t('ai:planDialog.create', { count: checkedTodos.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
