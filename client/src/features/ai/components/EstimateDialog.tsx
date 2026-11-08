import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendChat } from '@/features/ai/api/ai';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { withLanguageHint } from '@/features/ai/utils/languageHint';
import { parseEstimates } from '@/features/ai/utils/parseAiJson';
import { buildFullBacklogFilters, useBacklog, useBulkUpdate } from '@/features/todos';
import { STORY_POINT_VALUES } from '@/shared/config/constants';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import type { StoryPoints, Todo } from '@/shared/types/api';

/** Todos sent per request: keeps the prompt under the API message limit. */
const MAX_TODOS = 15;

export function buildEstimatePrompt(todos: readonly Todo[], language: string): string {
  const items = todos.map((todo) => ({ id: todo.id, title: todo.title.slice(0, 120), description: todo.description.slice(0, 160), type: todo.type }));
  const body = `Suggest story points for these todos. Allowed values: ${STORY_POINT_VALUES.join(', ')}. Reply ONLY with JSON: [{"id": string, "points": number}].\n${JSON.stringify(items)}`;
  return withLanguageHint(body, AI_LIMITS.messageMax, language);
}

/** "Estimate" (enhancement 16): suggestions for unestimated todos, Apply selected, validated against the allowed values. */
export function EstimateDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const fullScreen = useIsSmallScreen();
  const { run, isRunning } = useBulkUpdate(projectId);
  const [suggestions, setSuggestions] = useState<ReadonlyMap<string, number> | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const backlog = useBacklog(projectId, buildFullBacklogFilters());
  const unestimated = useMemo(() => (backlog.data ?? []).filter((todo) => todo.storyPoints === null), [backlog.data]);
  const sent = unestimated.slice(0, MAX_TODOS);
  const ask = useMutation({
    mutationFn: async () => {
      const response = await sendChat({ projectId, messages: [{ role: 'user', content: buildEstimatePrompt(sent, i18n.language) }] });
      return parseEstimates(response.message.content, new Set(sent.map((todo) => todo.id)), STORY_POINT_VALUES);
    },
    onSuccess: (result) => {
      setSuggestions(result);
      setSelected(new Set(result.keys()));
    },
  });
  const suggested = sent.filter((todo) => suggestions?.has(todo.id));

  const apply = async () => {
    const chosen = suggested.filter((todo) => selected.has(todo.id));
    await run(chosen, (todo) => ({ storyPoints: (suggestions?.get(todo.id) ?? null) as StoryPoints | null }), () => ({ storyPoints: null }));
    onClose();
  };

  return (
    <Dialog open onClose={ask.isPending || isRunning ? undefined : onClose} aria-labelledby={titleId} fullWidth maxWidth="sm" fullScreen={fullScreen} scroll="paper" aria-busy={ask.isPending}>
      <DialogTitle id={titleId}>{t('ai:estimate.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
        <Typography variant="body2" color="text.secondary">{t('ai:estimate.intro')}</Typography>
        {backlog.isPending ? <Skeleton variant="rounded" height={64} aria-label={t('common:app.loading')} /> : null}
        {backlog.isSuccess && unestimated.length === 0 ? <Alert severity="info">{t('ai:estimate.none')}</Alert> : null}
        {unestimated.length > MAX_TODOS ? <Typography variant="caption" color="text.secondary">{t('ai:estimate.limited', { count: MAX_TODOS })}</Typography> : null}
        {unestimated.length > 0 ? (
          <Box>
            <Button variant={suggestions === null ? 'contained' : 'outlined'} disabled={ask.isPending} onClick={() => ask.mutate()} startIcon={ask.isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : <AutoAwesomeIcon aria-hidden="true" />}>
              {t('ai:estimate.ask')}
            </Button>
          </Box>
        ) : null}
        {ask.isError ? <AiErrorAlert error={ask.error} onRetry={() => ask.mutate()} /> : null}
        {suggestions !== null && suggested.length === 0 ? <Alert severity="warning" role="alert">{t('ai:estimate.noValid')}</Alert> : null}
        {suggested.length > 0 ? (
          <Box component="ul" aria-label={t('ai:estimate.suggestions')} sx={{ listStyle: 'none', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {suggested.map((todo) => (
              <Box component="li" key={todo.id} sx={{ borderBottom: 1, borderColor: 'divider', paddingInline: 1, '&:last-child': { borderBottom: 0 } }}>
                <FormControlLabel
                  sx={{ display: 'flex', marginInline: 0, width: '100%' }}
                  slotProps={{ typography: { component: 'div', sx: { flex: 1, minWidth: 0 } } }}
                  control={<Checkbox checked={selected.has(todo.id)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(todo.id)) next.delete(todo.id); else next.add(todo.id); return next; })} />}
                  label={
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{todo.key}</Box>
                      <Box component="span" dir="auto" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{todo.title}</Box>
                      <Box component="span" sx={{ fontWeight: 'fontWeightBold', whiteSpace: 'nowrap' }}>{t('ai:estimate.points', { points: suggestions?.get(todo.id) })}</Box>
                    </Box>
                  }
                />
              </Box>
            ))}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 14rem' }}><AiDisclaimer /></Box>
        <Button color="inherit" onClick={onClose} disabled={isRunning}>{t('common:actions.cancel')}</Button>
        <Button variant="contained" onClick={() => void apply()} disabled={selected.size === 0 || suggested.length === 0 || isRunning}>{t('ai:estimate.apply')}</Button>
      </DialogActions>
    </Dialog>
  );
}
