import { z } from 'zod';
import { SPRINT_LIMITS } from '@/features/sprints/config/limits';
import { isDateOnly } from '@/shared/utils/formatDate';

const DATE_MESSAGE = 'Enter a valid date';
export const END_BEFORE_START_MESSAGE = 'End date must be on or after the start date';

const nameField = z.string().trim().max(SPRINT_LIMITS.nameMax, `Name must be at most ${SPRINT_LIMITS.nameMax} characters`);

const goalSchema = z
  .string()
  .trim()
  .max(SPRINT_LIMITS.goalMax, `Goal must be at most ${SPRINT_LIMITS.goalMax} characters`);

/** An empty string means "no date". */
const dateSchema = z.string().refine((value) => value === '' || isDateOnly(value), DATE_MESSAGE);

function isEndOnOrAfterStart(values: { startDate: string; endDate: string }): boolean {
  return values.startDate === '' || values.endDate === '' || values.endDate >= values.startDate;
}

const endDateRule = { message: END_BEFORE_START_MESSAGE, path: ['endDate'] };

/** Create: the name may stay empty (the server numbers the sprint). */
export const createSprintSchema = z
  .object({ name: nameField, goal: goalSchema, startDate: dateSchema, endDate: dateSchema })
  .refine(isEndOnOrAfterStart, endDateRule);

/** Edit: the server cannot clear a name, so an empty name is invalid. */
export const editSprintSchema = z
  .object({
    name: nameField.min(1, 'Name is required'),
    goal: goalSchema,
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(isEndOnOrAfterStart, endDateRule);

export const sprintFormFields = ['name', 'goal', 'startDate', 'endDate'] as const;

export const NAME_CREATE_HINT = 'Leave empty to name it automatically (for example “Sprint 3”).';
export const DATES_HINT = 'Optional. You choose the final dates when you start the sprint.';
