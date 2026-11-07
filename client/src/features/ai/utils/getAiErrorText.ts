import { AI_RATE_LIMIT_ADVICE } from '@/features/ai/config/copy';
import { ApiError } from '@/shared/api/client';
import type { ApiErrorCode } from '@/shared/api/client';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';

const ERROR_PREFIXES: Partial<Record<ApiErrorCode, string>> = {
  NETWORK_ERROR: 'Connection problem.',
  TIMEOUT: 'The AI took too long.',
  RATE_LIMITED: 'Too many AI requests.',
  AI_ERROR: 'The AI service had a problem.',
};

/**
 * What the user reads when an AI call fails: a short prefix per error code, then the server's own
 * message (it is safe to show). A rate limit also says to wait.
 */
export function getAiErrorText(error: unknown): string {
  const message = getErrorMessage(error);
  if (!(error instanceof ApiError)) return message;
  const prefix = ERROR_PREFIXES[error.code];
  const text = prefix === undefined ? message : `${prefix} ${message}`;
  return error.code === 'RATE_LIMITED' ? `${text} ${AI_RATE_LIMIT_ADVICE}` : text;
}
