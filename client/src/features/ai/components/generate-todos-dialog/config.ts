import type { TFunction } from 'i18next';
import { z } from 'zod';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { isWholeNumberInRange, parseWholeNumber } from '@/features/ai/utils/parseWholeNumber';
import type { GenerateTodosRequest } from '@/shared/types/api';

export function createGenerateTodosSchema(t: TFunction) {
  return z.object({
    prompt: z
      .string()
      .trim()
      .min(AI_LIMITS.promptMin, t('ai:generate.promptMin', { min: AI_LIMITS.promptMin }))
      .max(AI_LIMITS.promptMax, t('ai:generate.promptMax', { max: AI_LIMITS.promptMax })),
    // The count is typed as text, so "3.5" and "abc" can be told apart from a number.
    count: z
      .string()
      .refine((value) => isWholeNumberInRange(value, AI_LIMITS.countMin, AI_LIMITS.countMax), t('ai:generate.countInvalid', { min: AI_LIMITS.countMin, max: AI_LIMITS.countMax })),
  });
}

export type GenerateTodosFormValues = z.infer<ReturnType<typeof createGenerateTodosSchema>>;

export const GENERATE_DEFAULT_VALUES: GenerateTodosFormValues = {
  prompt: '',
  count: String(AI_LIMITS.countDefault),
};

export function toGenerateRequest(values: GenerateTodosFormValues): GenerateTodosRequest {
  return {
    prompt: values.prompt.trim(),
    count: parseWholeNumber(values.count) ?? AI_LIMITS.countDefault,
  };
}
