import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { fieldErrors } from '@/shared/api/client';

/**
 * Shows the server's `details[]` under the matching form fields.
 * Returns true when at least one field error was set; false means the caller
 * should show the message in the form-level alert instead.
 */
export function applyFieldErrors<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
  fields: readonly Path<TValues>[],
): boolean {
  const errors = fieldErrors(error);
  let isApplied = false;
  for (const field of fields) {
    const message = errors[field];
    if (message === undefined) continue;
    setError(field, { type: 'server', message }, { shouldFocus: !isApplied });
    isApplied = true;
  }
  return isApplied;
}
