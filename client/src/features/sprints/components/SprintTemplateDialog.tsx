import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSprintTemplate, TEMPLATE_LIMITS } from '@/features/sprints/utils/sprintTemplate';
import { DEFAULT_SPRINT_LENGTH_DAYS } from '@/features/sprints/config/limits';
import { DEFAULT_CAPACITY } from '@/features/sprints/utils/sprintTemplate';
import { setPreference } from '@/shared/lib/preferences';
import { showToast } from '@/shared/stores/toastStore';

/** Sprint templates (enhancement 14): default length and capacity, saved in `preferences.ts`. */
export function SprintTemplateDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const titleId = useId();
  const initial = getSprintTemplate();
  const [length, setLength] = useState(String(initial.lengthDays));
  const [capacity, setCapacity] = useState(String(initial.capacity));
  const lengthValue = Number(length);
  const capacityValue = Number(capacity);
  const lengthOk = Number.isInteger(lengthValue) && lengthValue >= TEMPLATE_LIMITS.lengthMin && lengthValue <= TEMPLATE_LIMITS.lengthMax;
  const capacityOk = Number.isInteger(capacityValue) && capacityValue >= TEMPLATE_LIMITS.capacityMin && capacityValue <= TEMPLATE_LIMITS.capacityMax;
  const save = () => {
    if (!lengthOk || !capacityOk) return;
    setPreference('sprintTemplate', { lengthDays: lengthValue, capacity: capacityValue });
    showToast(t('sprints:template.saved'));
    onClose();
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby={titleId}>
      <DialogTitle id={titleId}>{t('sprints:template.title')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
        <Typography variant="body2" color="text.secondary">{t('sprints:template.description')}</Typography>
        <TextField label={t('sprints:template.length')} type="number" value={length} onChange={(event) => setLength(event.target.value)} error={!lengthOk} helperText={lengthOk ? undefined : t('sprints:template.lengthInvalid')} slotProps={{ htmlInput: { min: TEMPLATE_LIMITS.lengthMin, max: TEMPLATE_LIMITS.lengthMax, inputMode: 'numeric' } }} />
        <TextField label={t('sprints:template.capacity')} type="number" value={capacity} onChange={(event) => setCapacity(event.target.value)} error={!capacityOk} helperText={capacityOk ? undefined : t('sprints:template.capacityInvalid')} slotProps={{ htmlInput: { min: TEMPLATE_LIMITS.capacityMin, max: TEMPLATE_LIMITS.capacityMax, inputMode: 'numeric' } }} />
        <Box>
          <Button size="small" color="inherit" onClick={() => { setLength(String(DEFAULT_SPRINT_LENGTH_DAYS)); setCapacity(String(DEFAULT_CAPACITY)); setPreference('sprintTemplate', undefined); }}>{t('sprints:template.reset')}</Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button color="inherit" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button variant="contained" onClick={save} disabled={!lengthOk || !capacityOk}>{t('sprints:template.save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
