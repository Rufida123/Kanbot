import { useQuery } from '@tanstack/react-query';
import { getAiStatus } from '@/features/ai/api/ai';
import { aiKeys } from '@/features/ai/api/keys';
import type { ApiError } from '@/shared/api/client';
import type { AiStatusResponse } from '@/shared/types/api';

/**
 * `mock` or `ai`. The answer cannot change while the app runs, so it is requested once and kept
 * (`staleTime` and `gcTime` are infinite). A failing status call never retries and never blocks
 * the UI: the caller simply shows no badge.
 */
export function useAiStatus() {
  return useQuery<AiStatusResponse, ApiError>({
    queryKey: aiKeys.status,
    queryFn: ({ signal }) => getAiStatus(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnReconnect: false,
  });
}
