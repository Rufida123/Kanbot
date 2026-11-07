import { z } from 'zod';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { isWholeNumberInRange, parseWholeNumber } from '@/features/ai/utils/parseWholeNumber';
import type { PlanSprintRequest } from '@/shared/types/api';

const CAPACITY_MESSAGE = `Enter a whole number from ${AI_LIMITS.capacityMin} to ${AI_LIMITS.capacityMax}`;

/** The capacity stays text in the form; the schema checks it (an empty box is invalid). */
export const planSprintSchema = z.object({
  capacity: z
    .string()
    .refine((value) => isWholeNumberInRange(value, AI_LIMITS.capacityMin, AI_LIMITS.capacityMax), CAPACITY_MESSAGE),
  focus: z.string().trim().max(AI_LIMITS.focusMax, `Use at most ${AI_LIMITS.focusMax} characters`),
});

export type PlanSprintFormValues = z.infer<typeof planSprintSchema>;

export const PLAN_DEFAULT_VALUES: PlanSprintFormValues = { capacity: '', focus: '' };

/** An empty focus is left out of the request. */
export function toPlanRequest(values: PlanSprintFormValues): PlanSprintRequest {
  const focus = values.focus.trim();
  return {
    capacity: parseWholeNumber(values.capacity) ?? AI_LIMITS.capacityMin,
    ...(focus !== '' && { focus }),
  };
}
