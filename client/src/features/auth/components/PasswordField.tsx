import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useState } from 'react';
import { FormTextField } from '@/shared/components/FormTextField';
import type { FormTextFieldProps } from '@/shared/components/FormTextField';

type PasswordFieldProps = Omit<FormTextFieldProps, 'type' | 'endAdornment'>;

/** Password input with a show/hide toggle. The toggle is a real button, reachable by keyboard. */
export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? 'Hide password' : 'Show password';

  return (
    <FormTextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            edge="end"
            size="small"
            aria-label={toggleLabel}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
            // Keep focus in the input when the toggle is pressed with the mouse.
            onMouseDown={(event) => event.preventDefault()}
          >
            {isVisible ? (
              <VisibilityOffIcon fontSize="small" aria-hidden="true" />
            ) : (
              <VisibilityIcon fontSize="small" aria-hidden="true" />
            )}
          </IconButton>
        </InputAdornment>
      }
    />
  );
}
