import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useId } from 'react';
import { SPRINT_LIMITS } from '@/features/sprints';

type GoalFieldProps = {
  value: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
};

/** The suggested sprint goal, editable before the sprint is created. Same look as `FormTextField`. */
export function GoalField({ value, isDisabled, onChange }: GoalFieldProps) {
  const id = useId();
  return (
    <FormControl fullWidth disabled={isDisabled}>
      <FormLabel htmlFor={id} sx={{ marginBottom: 0.75 }}>
        Sprint goal
      </FormLabel>
      <OutlinedInput
        id={id}
        multiline
        minRows={2}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ maxLength: SPRINT_LIMITS.goalMax, dir: 'auto' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <FormHelperText aria-hidden="true" sx={{ marginTop: 0.5 }}>
          {value.length}/{SPRINT_LIMITS.goalMax}
        </FormHelperText>
      </Box>
    </FormControl>
  );
}
