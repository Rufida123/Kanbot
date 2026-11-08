import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { buildStandup } from '@/features/ai/utils/buildStandup';
import type { Standup } from '@/features/ai/utils/buildStandup';
import { listTodos } from '@/features/todos/api/todos';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import { showToast } from '@/shared/stores/toastStore';
import type { Todo } from '@/shared/types/api';
import { formatDateOnly, getTodayDateOnly } from '@/shared/utils/formatDate';
import type { TFunction } from 'i18next';

/** Plain text for the clipboard: "Yesterday / Today / Blockers", one line per todo. */
export function formatStandupText(standup: Standup, t: TFunction, today: string): string {
  const section = (title: string, todos: readonly Todo[]) =>
    [`${title}:`, ...(todos.length === 0 ? [`- ${t('ai:standup.nothing')}`] : todos.map((todo) => `- ${todo.key} ${todo.title}`))].join('\n');
  return [
    t('ai:standup.heading', { date: formatDateOnly(today) }),
    '',
    section(t('ai:standup.yesterday'), standup.yesterday),
    '',
    section(t('ai:standup.today'), standup.today),
    '',
    section(t('ai:standup.blockers'), standup.blockers),
  ].join('\n');
}

/** Stand-up helper (enhancement 19). Built locally from `completedAt` and in-progress todos. */
export function StandupDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const titleId = useId();
  const fullScreen = useIsSmallScreen();
  const today = getTodayDateOnly();
  const { data, isPending } = useQuery({ queryKey: ['standup', projectId], queryFn: ({ signal }) => listTodos(projectId, {}, signal), staleTime: 0 });
  const standup = data === undefined ? null : buildStandup(data, today);
  const text = standup === null ? '' : formatStandupText(standup, t, today);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('ai:standup.copied'));
    } catch {
      showToast(t('ai:standup.copyFailed'), 'error');
    }
  };

  const block = (title: string, todos: readonly Todo[]) => (
    <Box component="section" aria-label={title}>
      <Typography component="h3" variant="subtitle2">{title}</Typography>
      <Box component="ul" sx={{ paddingInlineStart: 2.5 }}>
        {todos.length === 0 ? <li><Typography variant="body2" color="text.secondary">{t('ai:standup.nothing')}</Typography></li> : todos.map((todo) => (
          <li key={todo.id}><Typography variant="body2" dir="auto"><Box component="span" sx={{ color: 'text.secondary' }}>{todo.key}</Box> {todo.title}</Typography></li>
        ))}
      </Box>
    </Box>
  );

  return (
    <Dialog open onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth="sm" fullScreen={fullScreen} scroll="paper">
      <DialogTitle id={titleId}>{t('ai:standup.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
        <Typography variant="body2" color="text.secondary">{t('ai:standup.intro')}</Typography>
        {isPending || standup === null ? <Skeleton variant="rounded" height={120} aria-label={t('common:app.loading')} /> : (
          <>
            {block(t('ai:standup.yesterday'), standup.yesterday)}
            {block(t('ai:standup.today'), standup.today)}
            {block(t('ai:standup.blockers'), standup.blockers)}
            <Typography variant="caption" color="text.secondary">{t('ai:standup.blockedHint')}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button color="inherit" onClick={onClose}>{t('common:actions.close')}</Button>
        <Button variant="contained" startIcon={<ContentCopyIcon aria-hidden="true" />} onClick={() => void copy()} disabled={standup === null}>{t('ai:standup.copy')}</Button>
      </DialogActions>
    </Dialog>
  );
}
