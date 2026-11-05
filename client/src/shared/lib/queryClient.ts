import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/client';

const MAX_RETRIES = 2;

/** Retry only what can succeed later: network failures, timeouts and 5xx. Never 4xx. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  return error instanceof ApiError && error.isRetryable;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
