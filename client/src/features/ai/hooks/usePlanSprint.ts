import { useMutation } from '@tanstack/react-query';
import { planSprint } from '@/features/ai/api/ai';
import { aiMutationKeys } from '@/features/ai/api/keys';
import { useAbortSignal } from '@/features/ai/hooks/useAbortSignal';
import type { PlanSprintRequest } from '@/shared/types/api';

/** AI-3: asks for a sprint plan. Nothing is saved until the user creates the sprint. */
export function usePlanSprint(projectId: string) {
  const { start } = useAbortSignal();
  return useMutation({
    mutationKey: aiMutationKeys.planSprint(projectId),
    mutationFn: (request: PlanSprintRequest) =>
      planSprint({ projectId, request, signal: start() }),
  });
}
