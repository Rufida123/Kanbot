import { z } from 'zod';
import { PROJECT_LIMITS } from '@/features/projects/config/limits';
import { isProjectKeyValid } from '@/features/projects/utils/normalizeProjectKey';

const KEY_MESSAGE = `Key must be ${PROJECT_LIMITS.keyMin}–${PROJECT_LIMITS.keyMax} letters`;

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(PROJECT_LIMITS.nameMax, `Name must be at most ${PROJECT_LIMITS.nameMax} characters`);

const descriptionSchema = z
  .string()
  .trim()
  .max(
    PROJECT_LIMITS.descriptionMax,
    `Description must be at most ${PROJECT_LIMITS.descriptionMax} characters`,
  );

/** Create: the key may stay empty (the server generates one). */
export const createProjectSchema = z.object({
  name: nameSchema,
  key: z.string().refine((key) => key === '' || isProjectKeyValid(key), KEY_MESSAGE),
  description: descriptionSchema,
});

/** Edit: the server cannot clear a key, so an empty key is invalid. */
export const editProjectSchema = z.object({
  name: nameSchema,
  key: z.string().refine(isProjectKeyValid, KEY_MESSAGE),
  description: descriptionSchema,
});

export const projectFormFields = [
  'name',
  'key',
  'description',
] as const satisfies readonly (keyof z.infer<typeof createProjectSchema>)[];

export const emptyProjectFormValues: z.infer<typeof createProjectSchema> = {
  name: '',
  key: '',
  description: '',
};

export const KEY_CREATE_HINT = 'Leave empty to generate one from the name.';
export const KEY_EDIT_HINT = 'Changing the key does not change existing todo keys.';
export const KEY_TAKEN_MESSAGE = 'This key is already used';
