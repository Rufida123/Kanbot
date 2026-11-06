import { ApiError } from '@/shared/api/client';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/** The server's message for an `ApiError`, a generic one for anything else. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}
