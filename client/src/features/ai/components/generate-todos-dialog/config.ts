import { z } from 'zod';
import { AI_LIMITS } from '@/features/ai/config/limits';
import { isWholeNumberInRange, parseWholeNumber } from '@/features/ai/utils/parseWholeNumber';
import type { GenerateTodosRequest } from '@/shared/types/api';

const COUNT_MESSAGE = `Enter a whole number from ${AI_LIMITS.countMin} to ${AI_LIMITS.countMax}`;

/** The count stays text in the form (an empty box is a state the user can be in); the schema checks it. */
export const generateTodosSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(AI_LIMITS.promptMin, `Describe the feature in at least ${AI_LIMITS.promptMin} characters`)
    .max(AI_LIMITS.promptMax, `Use at most ${AI_LIMITS.promptMax} characters`),
  count: z.string().refine((value) => isWholeNumberInRange(value, AI_LIMITS.countMin, AI_LIMITS.countMax), COUNT_MESSAGE),
});

export type GenerateTodosFormValues = z.infer<typeof generateTodosSchema>;

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

export const PROMPT_PLACEHOLDER = 'Describe a feature… e.g. “User profile page with avatar upload”';
export const MOCK_PROMPT_HINT = 'Mock AI: each line of your text becomes one todo.';
export const EMPTY_RESULT_MESSAGE =
  'The AI did not suggest any todos. Try describing the feature in more detail.';
