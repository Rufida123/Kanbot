import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { LabelChips } from '@/shared/components/LabelChips';

type LabelFilterSelectProps = {
  projectId: string;
  labels: readonly string[];
  value: string | null;
  onChange: (label: string | null) => void;
};

/** "Filter by label" (enhancement 9). Renders nothing when the project has no labels. */
export function LabelFilterSelect({ projectId, labels, value, onChange }: LabelFilterSelectProps) {
  const { t } = useTranslation();
  const options = value !== null && !labels.includes(value) ? [...labels, value] : labels;
  if (options.length === 0) return null;
  return (
    <Select
      displayEmpty
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value === '' ? null : event.target.value)}
      inputProps={{ 'aria-label': t('todos:labelFilter.label') }}
      sx={{ minWidth: '10rem', maxWidth: '14rem' }}
    >
      <MenuItem value="">{t('todos:labelFilter.all')}</MenuItem>
      {options.map((label) => (
        <MenuItem key={label} value={label}>
          <LabelChips labels={[label]} projectId={projectId} />
        </MenuItem>
      ))}
    </Select>
  );
}
