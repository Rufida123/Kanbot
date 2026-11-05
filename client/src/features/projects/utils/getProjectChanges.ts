import type { Project, UpdateProjectRequest } from '@/shared/types/api';

export type ProjectFormValues = {
  name: string;
  key: string;
  description: string;
};

/**
 * Fields whose (trimmed) value differs from the saved project. Edit requests send only these,
 * so an untouched key is never re-sent (and `key: ''` is never sent at all).
 */
export function getProjectChanges(
  project: Pick<Project, 'name' | 'key' | 'description'>,
  values: ProjectFormValues,
): UpdateProjectRequest {
  const name = values.name.trim();
  const key = values.key.trim();
  const description = values.description.trim();
  return {
    ...(name !== project.name && { name }),
    ...(key !== project.key && key !== '' && { key }),
    ...(description !== project.description && { description }),
  };
}

export function hasChanges(changes: UpdateProjectRequest): boolean {
  return Object.keys(changes).length > 0;
}
