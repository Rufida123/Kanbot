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
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  placeholder?: string;
  autoFocus?: boolean;
  endAdornment?: OutlinedInputProps['endAdornment'];
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
}: FormTextFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const helperText = error?.message ?? hint;
  const { ref, ...inputProps } = registration;

  return (
    <FormControl fullWidth error={Boolean(error)} required={isRequired}>
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
        // `required` marks the label only: validation messages come from Zod (form uses noValidate).
        inputProps={{ 'aria-describedby': helperText ? helperId : undefined }}
      />
      {/* The slot is always rendered so an error appearing on blur never shifts the layout
          (a shift between mouse-down and mouse-up would swallow clicks on links below). */}
      <FormHelperText id={helperText ? helperId : undefined} sx={HELPER_SLOT_SX}>
        {helperText}
      </FormHelperText>
    </FormControl>
  );
}
