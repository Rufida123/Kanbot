import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import { useId } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import type { TodoFormValues } from '@/features/todos/components/todo-details-dialog/config';
import { normalizeLabels } from '@/features/todos/utils/normalizeLabels';

const EMPTY_OPTIONS: readonly string[] = [];

type LabelsError = FieldErrors<TodoFormValues>['labels'];

type LabelsFieldProps = {
  control: Control<TodoFormValues>;
  error?: LabelsError;
  isDisabled?: boolean;
};

/** The message of the whole list ("At most 10 labels") or of the first invalid label. */
function getLabelsErrorMessage(error: LabelsError): string | undefined {
  if (error === undefined) return undefined;
  if (typeof error.message === 'string') return error.message;
  for (const item of Object.values(error)) {
    if (typeof item === 'object' && item !== null && 'message' in item && typeof item.message === 'string') {
      return item.message;
    }
  }
  return undefined;
}

/**
 * Free-text tags: type and press Enter (or leave the field) to add. Values are trimmed,
 * de-duplicated and capped at 10, each at most 30 characters.
 */
export function LabelsField({ control, error, isDisabled = false }: LabelsFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;

  return (
    <Controller
      name="labels"
      control={control}
      render={({ field }) => {
        const hint = `${field.value.length}/${TODO_LIMITS.labelsMax} labels. Press Enter to add.`;
        const helperText = getLabelsErrorMessage(error) ?? hint;
        return (
          <FormControl fullWidth error={Boolean(error)} disabled={isDisabled}>
            <FormLabel htmlFor={id} sx={{ marginBottom: 0.75 }}>
              Labels
            </FormLabel>
            <Autocomplete
              multiple
              freeSolo
              disabled={isDisabled}
              autoSelect
              id={id}
              options={EMPTY_OPTIONS}
              value={field.value}
              onChange={(_event, newValue) => field.onChange(normalizeLabels(newValue))}
              onBlur={field.onBlur}
              renderValue={(value, getItemProps) =>
                value.map((label, index) => {
                  const { key, ...itemProps } = getItemProps({ index });
                  return <Chip key={key} size="small" label={label} {...itemProps} />;
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={field.ref}
                  placeholder={field.value.length === 0 ? 'Add a label' : undefined}
                  error={Boolean(error)}
                  slotProps={{
                    ...params.slotProps,
                    htmlInput: {
                      ...params.slotProps.htmlInput,
                      maxLength: TODO_LIMITS.labelMax,
                      'aria-describedby': helperId,
                    },
                  }}
                />
              )}
            />
            <Box sx={{ display: 'flex' }}>
              <FormHelperText id={helperId} sx={{ marginTop: 0.5, minHeight: '1.25rem' }}>
                {helperText}
              </FormHelperText>
            </Box>
          </FormControl>
        );
      }}
    />
  );
}
