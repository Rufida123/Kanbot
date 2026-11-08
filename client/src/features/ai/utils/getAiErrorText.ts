import { ApiError } from '@/shared/api/client';
import type { ApiErrorCode } from '@/shared/api/client';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const ERROR_PREFIX_KEYS: Partial<Record<ApiErrorCode, string>> = {
  NETWORK_ERROR: 'ai:errors.network',
  TIMEOUT: 'ai:errors.timeout',
  RATE_LIMITED: 'ai:errors.rateLimited',
  AI_ERROR: 'ai:errors.aiError',
};

/** A friendly line for an AI failure: a short prefix by error code, then the server message. */
export function getAiErrorText(error: unknown): string {
  const message = getErrorMessage(error);
  if (!(error instanceof ApiError)) return message;
  const prefixKey = ERROR_PREFIX_KEYS[error.code];
  const text = prefixKey === undefined ? message : `${t(prefixKey)} ${message}`;
  return error.code === 'RATE_LIMITED' ? `${text} ${t('ai:errors.rateLimitAdvice')}` : text;
}
