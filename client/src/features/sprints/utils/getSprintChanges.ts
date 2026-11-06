import type { CreateSprintRequest, Sprint, UpdateSprintRequest } from '@/shared/types/api';

/** Form values: an empty date string means "no date". */
export type SprintFormValues = {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
};

type SavedSprint = Pick<Sprint, 'name' | 'goal' | 'startDate' | 'endDate'>;

/** Saved values as form values: the form's defaults and the baseline the changes are measured from. */
export function toSprintFormValues(sprint: SavedSprint): SprintFormValues {
  return {
    name: sprint.name,
    goal: sprint.goal,
    startDate: sprint.startDate ?? '',
    endDate: sprint.endDate ?? '',
  };
}

/** The PATCH body: only the fields whose normalized value differs from the saved sprint. */
export function getSprintChanges(sprint: SavedSprint, values: SprintFormValues): UpdateSprintRequest {
  const name = values.name.trim();
  const goal = values.goal.trim();
  const startDate = values.startDate === '' ? null : values.startDate;
  const endDate = values.endDate === '' ? null : values.endDate;
  return {
    ...(name !== sprint.name && { name }),
    ...(goal !== sprint.goal && { goal }),
    ...(startDate !== sprint.startDate && { startDate }),
    ...(endDate !== sprint.endDate && { endDate }),
  };
}

export function hasSprintChanges(changes: UpdateSprintRequest): boolean {
  return Object.keys(changes).length > 0;
}

/** The POST body of a new sprint: only what was filled in (a blank name lets the server number it). */
export function getCreateSprintRequest(values: SprintFormValues): CreateSprintRequest {
  const name = values.name.trim();
  const goal = values.goal.trim();
  return {
    ...(name !== '' && { name }),
    ...(goal !== '' && { goal }),
    ...(values.startDate !== '' && { startDate: values.startDate }),
    ...(values.endDate !== '' && { endDate: values.endDate }),
  };
}
