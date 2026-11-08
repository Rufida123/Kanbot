import type { TFunction } from 'i18next';
import { z } from 'zod';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { isWholeNumberInRange, parseWholeNumber } from '@/features/ai/utils/parseWholeNumber';
import type { PlanSprintRequest } from '@/shared/types/api';

export function createPlanSprintSchema(t: TFunction) {
  return z.object({
    capacity: z
      .string()
      .refine((value) => isWholeNumberInRange(value, AI_LIMITS.capacityMin, AI_LIMITS.capacityMax), t('ai:planDialog.capacityInvalid', { min: AI_LIMITS.capacityMin, max: AI_LIMITS.capacityMax })),
    focus: z.string().trim().max(AI_LIMITS.focusMax, t('ai:planDialog.focusMax', { max: AI_LIMITS.focusMax })),
  });
}

export type PlanSprintFormValues = z.infer<ReturnType<typeof createPlanSprintSchema>>;

export const PLAN_DEFAULT_VALUES: PlanSprintFormValues = { capacity: '', focus: '' };

export function toPlanRequest(values: PlanSprintFormValues): PlanSprintRequest {
  const focus = values.focus.trim();
  return {
    capacity: parseWholeNumber(values.capacity) ?? AI_LIMITS.capacityMin,
    ...(focus !== '' && { focus }),
  };
}
