import type { TFunction } from 'i18next';
import { z } from 'zod';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { STORY_POINT_VALUES } from '@/shared/config/constants';
import { TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from '@/shared/types/api';
import { isDateOnly } from '@/shared/utils/formatDate';

const STORY_POINT_CHOICES: readonly string[] = ['', ...STORY_POINT_VALUES.map(String)];

export function createTodoFormSchema(t: TFunction) {
  const titleSchema = z
    .string()
    .trim()
    .min(1, t('todos:validation.titleRequired'))
    .max(TODO_LIMITS.titleMax, t('todos:validation.titleMax', { max: TODO_LIMITS.titleMax }));
  const descriptionSchema = z
    .string()
    .max(TODO_LIMITS.descriptionMax, t('todos:validation.descriptionMax', { max: TODO_LIMITS.descriptionMax }));
  const labelsSchema = z
    .array(
      z
        .string()
        .trim()
        .min(1, t('todos:validation.labelEmpty'))
        .max(TODO_LIMITS.labelMax, t('todos:validation.labelMax', { max: TODO_LIMITS.labelMax })),
    )
    .max(TODO_LIMITS.labelsMax, t('todos:validation.labelsMax', { max: TODO_LIMITS.labelsMax }));
  return z.object({
    title: titleSchema,
    description: descriptionSchema,
    type: z.enum(TODO_TYPES),
    status: z.enum(TODO_STATUSES),
    priority: z.enum(TODO_PRIORITIES),
    storyPoints: z.string().refine((value) => STORY_POINT_CHOICES.includes(value), t('todos:validation.invalidValue')),
    labels: labelsSchema,
    dueDate: z.string().refine((value) => value === '' || isDateOnly(value), t('todos:validation.invalidDate')),
    sprintId: z.string(),
  });
}

export type TodoFormValues = z.infer<ReturnType<typeof createTodoFormSchema>>;

/** Fields that can receive a server validation error (`details[].path`). */
export const todoFormFields = [
  'title',
  'description',
  'type',
  'status',
  'priority',
  'storyPoints',
  'labels',
  'dueDate',
  'sprintId',
] as const satisfies readonly (keyof TodoFormValues)[];
