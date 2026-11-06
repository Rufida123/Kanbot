import { z } from 'zod';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { STORY_POINT_VALUES } from '@/shared/config/constants';
import { TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from '@/shared/types/api';
import { isDateOnly } from '@/shared/utils/formatDate';

const STORY_POINT_CHOICES: readonly string[] = ['', ...STORY_POINT_VALUES.map(String)];

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(TODO_LIMITS.titleMax, `Title must be at most ${TODO_LIMITS.titleMax} characters`);

const descriptionSchema = z
  .string()
  .max(
    TODO_LIMITS.descriptionMax,
    `Description must be at most ${TODO_LIMITS.descriptionMax} characters`,
  );

const labelsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'A label cannot be empty')
      .max(TODO_LIMITS.labelMax, `A label must be at most ${TODO_LIMITS.labelMax} characters`),
  )
  .max(TODO_LIMITS.labelsMax, `At most ${TODO_LIMITS.labelsMax} labels`);

/**
 * Form values are all strings or arrays so inputs stay controlled: story points `''` = not
 * estimated, due date `''` = none, sprint `''` = backlog. `getTodoChanges` converts them back.
 */
export const todoFormSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  type: z.enum(TODO_TYPES),
  status: z.enum(TODO_STATUSES),
  priority: z.enum(TODO_PRIORITIES),
  storyPoints: z.string().refine((value) => STORY_POINT_CHOICES.includes(value), 'Choose a valid value'),
  labels: labelsSchema,
  dueDate: z.string().refine((value) => value === '' || isDateOnly(value), 'Enter a valid date'),
  sprintId: z.string(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;

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
