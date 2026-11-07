import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { useId } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

const HELPER_SLOT_SX = { marginTop: 0.5, minHeight: '1.25rem' } as const;

export type FormTextFieldProps = {
  label: string;
  /** Result of `register('field')` from react-hook-form. */
  registration: UseFormRegisterReturn;
  error?: FieldError;
  /** Shown under the input while there is no error. */
  hint?: string;
  isRequired?: boolean;
  type?: 'text' | 'email' | 'password' | 'date';
  autoComplete?: string;
  placeholder?: string;
  autoFocus?: boolean;
  endAdornment?: OutlinedInputProps['endAdornment'];
  /** Multi-line textarea (descriptions). */
  isMultiline?: boolean;
  minRows?: number;
  maxLength?: number;
  /** Small text on the right under the input, for example "12/500". */
  counter?: string;
  isDisabled?: boolean;
};

/** Label above the input (as in the wireframes), error and hint below. */
export function FormTextField({
  label,
  registration,
  error,
  hint,
  isRequired = false,
  type = 'text',
  autoComplete,
  placeholder,
  autoFocus,
  endAdornment,
  isMultiline = false,
  minRows,
  maxLength,
  counter,
  isDisabled = false,
}: FormTextFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const helperText = error?.message ?? hint;
  const { ref, ...inputProps } = registration;

  return (
    <FormControl fullWidth error={Boolean(error)} required={isRequired} disabled={isDisabled}>
      <FormLabel htmlFor={id} sx={{ marginBottom: 0.75 }}>
        {label}
      </FormLabel>
      <OutlinedInput
        {...inputProps}
        inputRef={ref}
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        autoFocus={autoFocus}
        endAdornment={endAdornment}
        multiline={isMultiline}
        minRows={minRows}
        // `required` marks the label only: validation messages come from Zod (form uses noValidate).
        inputProps={{ 'aria-describedby': helperText ? helperId : undefined, maxLength }}
      />
      {/* The slot is always rendered so an error appearing on blur never shifts the layout
          (a shift between mouse-down and mouse-up would swallow clicks on links below). */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <FormHelperText id={helperText ? helperId : undefined} sx={HELPER_SLOT_SX}>
          {helperText}
        </FormHelperText>
        {counter ? (
          <FormHelperText aria-hidden="true" sx={{ ...HELPER_SLOT_SX, flexShrink: 0 }}>
            {counter}
          </FormHelperText>
        ) : null}
      </Box>
    </FormControl>
  );
}
