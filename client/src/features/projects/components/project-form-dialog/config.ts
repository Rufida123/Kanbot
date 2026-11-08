import type { TFunction } from 'i18next';
import { z } from 'zod';
import { PROJECT_LIMITS } from '@/features/projects/config/limits';
import { isProjectKeyValid } from '@/features/projects/utils/normalizeProjectKey';

/** Schemas are built at render time so validation messages follow the active language. */
export function createProjectSchemas(t: TFunction) {
  const keyMessage = t('projects:validation.keyLength', { min: PROJECT_LIMITS.keyMin, max: PROJECT_LIMITS.keyMax });
  const nameSchema = z
    .string()
    .trim()
    .min(1, t('projects:validation.nameRequired'))
    .max(PROJECT_LIMITS.nameMax, t('projects:validation.nameMax', { max: PROJECT_LIMITS.nameMax }));
  const descriptionSchema = z
    .string()
    .trim()
    .max(PROJECT_LIMITS.descriptionMax, t('projects:validation.descriptionMax', { max: PROJECT_LIMITS.descriptionMax }));
  return {
    create: z.object({
      name: nameSchema,
      key: z.string().refine((key) => key === '' || isProjectKeyValid(key), keyMessage),
      description: descriptionSchema,
    }),
    edit: z.object({
      name: nameSchema,
      key: z.string().refine(isProjectKeyValid, keyMessage),
      description: descriptionSchema,
    }),
  };
}

type ProjectSchemaValues = { name: string; key: string; description: string };

export const projectFormFields = [
  'name',
  'key',
  'description',
] as const satisfies readonly (keyof ProjectSchemaValues)[];

export const emptyProjectFormValues: ProjectSchemaValues = {
  name: '',
  key: '',
  description: '',
};
