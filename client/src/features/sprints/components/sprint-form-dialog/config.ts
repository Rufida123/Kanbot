import type { TFunction } from 'i18next';
import { z } from 'zod';
import { SPRINT_LIMITS } from '@/features/sprints/config/limits';
import { isDateOnly } from '@/shared/utils/formatDate';

function isEndOnOrAfterStart(values: { startDate: string; endDate: string }): boolean {
  return values.startDate === '' || values.endDate === '' || values.endDate >= values.startDate;
}

/** Built at render time so the messages follow the active language. */
export function createSprintSchemas(t: TFunction) {
  const nameField = z.string().trim().max(SPRINT_LIMITS.nameMax, t('sprints:validation.nameMax', { max: SPRINT_LIMITS.nameMax }));
  const goalSchema = z.string().trim().max(SPRINT_LIMITS.goalMax, t('sprints:validation.goalMax', { max: SPRINT_LIMITS.goalMax }));
  const dateSchema = z.string().refine((value) => value === '' || isDateOnly(value), t('sprints:validation.dateInvalid'));
  const endDateRule = { message: t('sprints:validation.endBeforeStart'), path: ['endDate'] };
  return {
    create: z.object({ name: nameField, goal: goalSchema, startDate: dateSchema, endDate: dateSchema }).refine(isEndOnOrAfterStart, endDateRule),
    edit: z
      .object({ name: nameField.min(1, t('sprints:validation.nameRequired')), goal: goalSchema, startDate: dateSchema, endDate: dateSchema })
      .refine(isEndOnOrAfterStart, endDateRule),
  };
}

export const sprintFormFields = ['name', 'goal', 'startDate', 'endDate'] as const;
