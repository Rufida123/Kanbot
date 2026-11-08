import { ApiError } from '@/shared/api/client';
import { t } from '@/shared/i18n';

/** The server's message for an `ApiError`, a generic one for anything else. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : t('common:errors.generic');
}
