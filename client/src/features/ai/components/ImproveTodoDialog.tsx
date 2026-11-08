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
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendChat } from '@/features/ai/api/ai';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { withLanguageHint } from '@/features/ai/utils/languageHint';
import { parseImprovement } from '@/features/ai/utils/parseAiJson';
import type { Improvement } from '@/features/ai/utils/parseAiJson';
import { TODO_LIMITS, useUpdateTodo } from '@/features/todos';
import { useTodo } from '@/features/todos/hooks/useTodo';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import type { Todo } from '@/shared/types/api';

type FieldKey = 'title' | 'description' | 'criteria';

/** The description with the acceptance criteria appended as a Markdown list. */
export function composeDescription(base: string, criteria: readonly string[], heading: string): string {
  if (criteria.length === 0) return base;
  const list = criteria.map((item) => `- ${item}`).join('\n');
  return `${base.trimEnd()}${base.trim() === '' ? '' : '\n\n'}**${heading}**\n${list}`;
}

function buildPrompt(todo: Todo, language: string): string {
  const body = [
    'Improve this todo. Reply ONLY with JSON in this exact shape, no other text:',
    '{"title": string, "description": string, "acceptanceCriteria": string[]}',
    `Title: ${todo.title}`,
    `Description: ${todo.description === '' ? '(none)' : todo.description.slice(0, 1500)}`,
    `Type: ${todo.type}. Priority: ${todo.priority}.`,
  ].join('\n');
  // The language hint is part of the prompt text; the JSON keys stay in English.
  return withLanguageHint(`${body}\nKeep the JSON keys in English.`, AI_LIMITS.messageMax, language);
}

/** "Improve this todo" (enhancement 15): diff-like preview, Apply edits only the fields kept selected. */
export function ImproveTodoDialog({ todoId, onClose }: { todoId: string; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const fullScreen = useIsSmallScreen();
  const { data: todo } = useTodo(todoId);
  const updateMutation = useUpdateTodo();
  const [proposal, setProposal] = useState<Improvement | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<FieldKey>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const ask = useMutation({
    mutationFn: async (current: Todo) => {
      const response = await sendChat({
        projectId: current.projectId,
        messages: [{ role: 'user', content: buildPrompt(current, i18n.language) }],
      });
      const parsed = parseImprovement(response.message.content);
      if (parsed === null) throw new Error('invalid');
      return parsed;
    },
    onSuccess: (result) => {
      setProposal(result);
      setNotice(null);
      const keys: FieldKey[] = [];
      if (result.title !== null) keys.push('title');
      if (result.description !== null) keys.push('description');
      if (result.criteria.length > 0) keys.push('criteria');
      setSelected(new Set(keys));
    },
  });

  const toggle = (key: FieldKey) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const apply = () => {
    if (todo === undefined || proposal === null) return;
    const changes: { title?: string; description?: string } = {};
    let skipped = false;
    if (selected.has('title') && proposal.title !== null) {
      if (proposal.title.length <= TODO_LIMITS.titleMax) changes.title = proposal.title;
      else skipped = true;
    }
    const useDescription = selected.has('description') && proposal.description !== null;
    const useCriteria = selected.has('criteria') && proposal.criteria.length > 0;
    if (useDescription || useCriteria) {
      const base = useDescription ? (proposal.description ?? '') : todo.description;
      const description = useCriteria ? composeDescription(base, proposal.criteria, t('ai:improve.criteriaHeading')) : base;
      if (description.length <= TODO_LIMITS.descriptionMax) changes.description = description;
      else skipped = true;
    }
    if (Object.keys(changes).length === 0) {
      setNotice(skipped ? t('ai:improve.tooLong') : t('ai:improve.nothingSelected'));
      return;
    }
    updateMutation.mutate(
      {
        todoId: todo.id,
        changes,
        previous: { projectId: todo.projectId, sprintId: todo.sprintId },
        successMessage: t('ai:improve.applied', { key: todo.key }),
        // Undo restores the previous title and description.
        undoChanges: { title: todo.title, description: todo.description },
      },
      { onSuccess: onClose },
    );
  };

  const row = (key: FieldKey, label: string, before: string, after: string | null) =>
    after === null ? null : (
      <Box key={key} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, padding: 1.5 }}>
        <FormControlLabel
          control={<Checkbox checked={selected.has(key)} onChange={() => toggle(key)} />}
          label={<Typography variant="subtitle2">{label}</Typography>}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('ai:improve.current')}</Typography>
            <Typography dir="auto" variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', backgroundColor: 'action.hover', padding: 1, borderRadius: 1 }}>{before === '' ? t('ai:improve.empty') : before}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('ai:improve.proposed')}</Typography>
            <Typography dir="auto" variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', border: 1, borderColor: 'success.main', padding: 1, borderRadius: 1 }}>{after}</Typography>
          </Box>
        </Box>
      </Box>
    );

  return (
    <Dialog open onClose={ask.isPending ? undefined : onClose} aria-labelledby={titleId} aria-busy={ask.isPending} fullWidth maxWidth="md" fullScreen={fullScreen} scroll="paper">
      <DialogTitle id={titleId}>{t('ai:improve.title', { key: todo?.key ?? '' })}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
        <Typography variant="body2" color="text.secondary">{t('ai:improve.intro')}</Typography>
        <Box>
          <Button
            variant={proposal === null ? 'contained' : 'outlined'}
            disabled={todo === undefined || ask.isPending}
            onClick={() => todo && ask.mutate(todo)}
            startIcon={ask.isPending ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : <AutoAwesomeIcon aria-hidden="true" />}
          >
            {ask.isPending ? t('ai:improve.asking') : t('ai:improve.ask')}
          </Button>
        </Box>
        {ask.isError ? (ask.error instanceof Error && ask.error.message === 'invalid' ? <Alert severity="warning" role="alert">{t('ai:improve.invalid')}</Alert> : <AiErrorAlert error={ask.error} onRetry={() => todo && ask.mutate(todo)} />) : null}
        {notice === null ? null : <Alert severity="info" role="status">{notice}</Alert>}
        {todo !== undefined && proposal !== null ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {row('title', t('ai:improve.fieldTitle'), todo.title, proposal.title)}
            {row('description', t('ai:improve.fieldDescription'), todo.description, proposal.description)}
            {row('criteria', t('ai:improve.fieldCriteria'), '', proposal.criteria.length === 0 ? null : proposal.criteria.map((item) => `• ${item}`).join('\n'))}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 14rem' }}><AiDisclaimer /></Box>
        <Button color="inherit" onClick={onClose} disabled={ask.isPending}>{t('common:actions.discard')}</Button>
        <Button variant="contained" onClick={apply} disabled={proposal === null || selected.size === 0 || updateMutation.isPending}>{t('ai:improve.apply')}</Button>
      </DialogActions>
    </Dialog>
  );
}
