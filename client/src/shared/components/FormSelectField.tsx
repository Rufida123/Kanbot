import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import type { SelectOption } from '@/shared/config/constants';

const HELPER_SLOT_SX = { marginTop: 0.5, minHeight: '1.25rem' } as const;

type FormSelectFieldProps<TValues extends FieldValues> = {
  label: string;
  name: Path<TValues>;
  control: Control<TValues>;
  options: readonly SelectOption[];
  error?: FieldError;
  /** Shown under the select while there is no error. */
  hint?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Custom content for an option (icon + text). Defaults to the label. */
  renderOption?: (option: SelectOption) => ReactNode;
};

/** Select with the label above (same look as `FormTextField`), wired to react-hook-form. */
export function FormSelectField<TValues extends FieldValues>({
  label,
  name,
  control,
  options,
  error,
  hint,
  isRequired = false,
  isDisabled = false,
  renderOption,
}: FormSelectFieldProps<TValues>) {
  const id = useId();
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const helperText = error?.message ?? hint;

  return (
    <FormControl fullWidth error={Boolean(error)} required={isRequired} disabled={isDisabled}>
      <FormLabel id={labelId} sx={{ marginBottom: 0.75 }}>
        {label}
      </FormLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            id={id}
            labelId={labelId}
            name={field.name}
            value={String(field.value ?? '')}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            inputRef={field.ref}
            aria-describedby={helperText ? helperId : undefined}
            MenuProps={{ slotProps: { paper: { sx: { maxHeight: '18rem' } } } }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {renderOption ? renderOption(option) : option.label}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      <Box sx={{ display: 'flex' }}>
        <FormHelperText id={helperText ? helperId : undefined} sx={HELPER_SLOT_SX}>
          {helperText}
        </FormHelperText>
      </Box>
    </FormControl>
  );
}
