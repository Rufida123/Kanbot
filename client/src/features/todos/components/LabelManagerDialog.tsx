import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { todoKeys } from '@/features/todos/api/keys';
import { listTodos } from '@/features/todos/api/todos';
import { useBulkUpdate } from '@/features/todos/hooks/useBulkUpdate';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import { useLabelColors } from '@/shared/hooks/useLabelColors';
import { isLabelColor, LABEL_HUES, LABEL_PALETTE, renameLabelColor, setLabelColor } from '@/shared/lib/labelColors';
import type { LabelColorKey } from '@/shared/lib/labelColors';
import { showToast } from '@/shared/stores/toastStore';

type LabelManagerDialogProps = { projectId: string; onClose: () => void };

function Swatches({ value, onChange, name }: { value: string | undefined; onChange: (color: LabelColorKey | null) => void; name: string }) {
  const { t } = useTranslation();
  return (
    <Box role="radiogroup" aria-label={t('todos:labelManager.colour', { name })} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {LABEL_PALETTE.map((color) => (
        <Box
          key={color}
          component="button"
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(value === color ? null : color)}
          sx={{ all: 'unset', cursor: 'pointer', width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: LABEL_HUES[color], boxShadow: value === color ? (theme) => `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.text.primary}` : 'none', '&:focus-visible': { outline: '2px solid', outlineColor: 'focusRing', outlineOffset: '3px' }, '@media (pointer: coarse)': { width: '2rem', height: '2rem' } }}
        />
      ))}
    </Box>
  );
}

/**
 * Label manager (enhancement 9): create, rename, recolour and delete the labels of one project.
 * The backend stores label strings on todos, so rename/delete patch every todo that uses the label
 * (client-side loop); colours live in `preferences.ts`. A label with no todo is only a colour entry.
 */
export function LabelManagerDialog({ projectId, onClose }: LabelManagerDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const colors = useLabelColors(projectId);
  const titleId = useId();
  const fullScreen = useIsSmallScreen();
  const { run, isRunning } = useBulkUpdate(projectId);
  const [editing, setEditing] = useState<{ from: string; value: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data: todos } = useQuery({ queryKey: [...todoKeys.all(projectId), 'labels'], queryFn: ({ signal }) => listTodos(projectId, {}, signal), staleTime: 15_000 });

  const labels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const todo of todos ?? []) for (const label of todo.labels) counts.set(label, (counts.get(label) ?? 0) + 1);
    for (const label of Object.keys(colors)) if (!counts.has(label)) counts.set(label, 0);
    return [...counts].sort((a, b) => a[0].localeCompare(b[0]));
  }, [todos, colors]);

  const withLabel = (label: string) => (todos ?? []).filter((todo) => todo.labels.includes(label));
  const refreshLabels = () => void queryClient.invalidateQueries({ queryKey: [...todoKeys.all(projectId), 'labels'] });

  const rename = async (from: string, to: string) => {
    const name = to.trim();
    if (name === '' || name === from) return setEditing(null);
    if (name.length > TODO_LIMITS.labelMax) return setError(t('todos:validation.labelMax', { max: TODO_LIMITS.labelMax }));
    if (labels.some(([label]) => label === name)) return setError(t('todos:labelManager.exists'));
    const affected = withLabel(from);
    await run(affected, (todo) => ({ labels: todo.labels.map((label) => (label === from ? name : label)) }), (todo) => ({ labels: todo.labels }));
    renameLabelColor(projectId, from, name);
    setEditing(null);
    setError(null);
    refreshLabels();
  };

  const remove = async (label: string) => {
    const affected = withLabel(label);
    await run(affected, (todo) => ({ labels: todo.labels.filter((item) => item !== label) }), (todo) => ({ labels: todo.labels }));
    setLabelColor(projectId, label, null);
    refreshLabels();
  };

  const create = () => {
    const name = draft.trim();
    if (name === '') return;
    if (name.length > TODO_LIMITS.labelMax) return setError(t('todos:validation.labelMax', { max: TODO_LIMITS.labelMax }));
    if (labels.some(([label]) => label === name)) return setError(t('todos:labelManager.exists'));
    setLabelColor(projectId, name, 'blue');
    setDraft('');
    setError(null);
    showToast(t('todos:labelManager.createdHint'), 'info');
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen} aria-labelledby={titleId}>
      <DialogTitle id={titleId}>{t('todos:labelManager.title')}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
          <InputBase
            value={draft}
            onChange={(event) => { setDraft(event.target.value); setError(null); }}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); create(); } }}
            placeholder={t('todos:labelManager.newName')}
            inputProps={{ 'aria-label': t('todos:labelManager.newName'), maxLength: TODO_LIMITS.labelMax, dir: 'auto' }}
            sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, paddingInline: 1.5 }}
          />
          <Button variant="contained" onClick={create} disabled={draft.trim() === ''}>{t('todos:labelManager.create')}</Button>
        </Box>
        {error ? <Typography role="alert" color="error" variant="body2" sx={{ marginBottom: 1 }}>{error}</Typography> : null}
        {labels.length === 0 ? <Typography color="text.secondary" variant="body2">{t('todos:labelManager.empty')}</Typography> : null}
        <Box component="ul" sx={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {labels.map(([label, count]) => (
            <Box component="li" key={label} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
              <Box aria-hidden="true" sx={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: isLabelColor(colors[label]) ? LABEL_HUES[colors[label] as LabelColorKey] : 'divider' }} />
              {editing?.from === label ? (
                <InputBase
                  autoFocus
                  value={editing.value}
                  onChange={(event) => setEditing({ from: label, value: event.target.value })}
                  onKeyDown={(event) => { if (event.key === 'Enter') void rename(label, editing.value); if (event.key === 'Escape') { event.stopPropagation(); setEditing(null); } }}
                  onBlur={() => void rename(label, editing.value)}
                  inputProps={{ 'aria-label': t('todos:labelManager.rename', { name: label }), dir: 'auto', maxLength: TODO_LIMITS.labelMax }}
                  sx={{ flex: '1 1 8rem', border: 1, borderColor: 'primary.main', borderRadius: 1, paddingInline: 1 }}
                />
              ) : (
                <Typography dir="auto" sx={{ flex: '1 1 8rem', minWidth: 0, overflowWrap: 'anywhere' }}>{label} <Typography component="span" variant="caption" color="text.secondary">{t('todos:labelManager.uses', { count })}</Typography></Typography>
              )}
              <Swatches name={label} value={colors[label]} onChange={(color) => setLabelColor(projectId, label, color)} />
              <Tooltip title={t('todos:labelManager.rename', { name: label })}>
                <IconButton size="small" aria-label={t('todos:labelManager.rename', { name: label })} disabled={isRunning} onClick={() => setEditing({ from: label, value: label })}><EditOutlinedIcon fontSize="small" aria-hidden="true" /></IconButton>
              </Tooltip>
              <Tooltip title={t('todos:labelManager.delete', { name: label })}>
                <IconButton size="small" color="error" aria-label={t('todos:labelManager.delete', { name: label })} disabled={isRunning} onClick={() => void remove(label)}><DeleteOutlinedIcon fontSize="small" aria-hidden="true" /></IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={onClose}>{t('common:actions.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
