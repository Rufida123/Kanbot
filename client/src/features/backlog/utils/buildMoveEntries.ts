import { getListLength, getTodoPosition } from '@/features/todos';
import type { Sprint, Todo } from '@/shared/types/api';

export type MoveTarget =
  | { kind: 'top' }
  | { kind: 'bottom' }
  | { kind: 'sprint'; sprint: Sprint }
  | { kind: 'backlog' };

export type MoveEntry = {
  id: string;
  label: string;
  /** Why it is unavailable, shown in the menu. `null` = available. */
  disabledReason: string | null;
  target: MoveTarget;
};

export const FILTERED_MOVE_REASON = 'Clear filters to move within the backlog';
const LOADING_REASON = 'The list is still loading';
const AT_TOP_REASON = 'Already at the top';
const AT_BOTTOM_REASON = 'Already at the bottom';

type BuildMoveEntriesParams = {
  todo: Todo;
  /**
   * The todo's own list as cached, in order: the whole backlog (never a filtered one) or its
   * sprint's list. `undefined` when it is not available.
   */
  ownList: readonly Todo[] | undefined;
  /** The backlog is narrowed by a filter, so its indexes are not real positions. */
  isOwnListFiltered: boolean;
  sprints: readonly Sprint[] | undefined;
};

function getWithinListEntries(params: BuildMoveEntriesParams): MoveEntry[] {
  const { todo, ownList, isOwnListFiltered } = params;
  const isGrouped = todo.sprintId !== null;
  const unavailableReason = isOwnListFiltered
    ? FILTERED_MOVE_REASON
    : ownList === undefined
      ? LOADING_REASON
      : null;
  const position = ownList === undefined ? -1 : getTodoPosition(ownList, todo.id, isGrouped);
  const lastPosition =
    ownList === undefined ? -1 : getListLength(ownList, todo.status, isGrouped) - 1;
  return [
    {
      id: 'move-top',
      label: 'Move to top',
      disabledReason: unavailableReason ?? (position === 0 ? AT_TOP_REASON : null),
      target: { kind: 'top' },
    },
    {
      id: 'move-bottom',
      label: 'Move to bottom',
      disabledReason: unavailableReason ?? (position === lastPosition ? AT_BOTTOM_REASON : null),
      target: { kind: 'bottom' },
    },
  ];
}

/**
 * The "Move to…" entries of a todo's menu (BL-5, BL-7): top and bottom of its own list, the
 * backlog (when it is in a sprint), every other planned sprint and the active sprint.
 * Completed sprints are never targets, and their todos are not shown here at all.
 */
export function buildMoveEntries(params: BuildMoveEntriesParams): MoveEntry[] {
  const { todo, sprints } = params;
  const entries = getWithinListEntries(params);
  if (todo.sprintId !== null) {
    entries.push({ id: 'move-backlog', label: 'Move to backlog', disabledReason: null, target: { kind: 'backlog' } });
  }
  for (const sprint of sprints ?? []) {
    if (sprint.id === todo.sprintId || sprint.status === 'completed') continue;
    entries.push({
      id: `move-${sprint.id}`,
      label: sprint.status === 'active' ? `Move to ${sprint.name} (active)` : `Move to ${sprint.name}`,
      disabledReason: null,
      target: { kind: 'sprint', sprint },
    });
  }
  return entries;
}
