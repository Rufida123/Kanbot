import type { TodoListFilters } from '@/features/todos/api/keys';
import type { TodoListQuery, TodoPriority, TodoType } from '@/shared/types/api';

export const BACKLOG_SPRINT_ID = 'backlog';

type BacklogFilterValues = {
  search: string;
  priority: TodoPriority | null;
  type: TodoType | null;
};

/** The filters of the backlog list as they appear in the query key (trimmed search). */
export function buildTodoListFilters(values: BacklogFilterValues): TodoListFilters {
  return {
    sprintId: BACKLOG_SPRINT_ID,
    q: values.search.trim(),
    priority: values.priority,
    type: values.type,
  };
}

/** Request params of the list endpoint. The API names the search param `search`; empty ones are omitted. */
export function toTodoListQuery(filters: TodoListFilters): TodoListQuery {
  return {
    sprintId: filters.sprintId,
    ...(filters.q !== '' && { search: filters.q }),
    ...(filters.priority !== null && { priority: filters.priority }),
    ...(filters.type !== null && { type: filters.type }),
  };
}

/** True when any filter narrows the list (used to tell "empty" from "no matches"). */
export function hasTodoFilters(filters: TodoListFilters): boolean {
  return filters.q !== '' || filters.priority !== null || filters.type !== null;
}

/** The filters of a planned sprint's list: its own id, never narrowed by the backlog filters. */
export function buildSprintListFilters(sprintId: string): TodoListFilters {
  return { sprintId, q: '', priority: null, type: null };
}

/** The unfiltered backlog: the only backlog list whose array index is the real position. */
export function buildFullBacklogFilters(): TodoListFilters {
  return buildTodoListFilters({ search: '', priority: null, type: null });
}
