import { getListLength, getTodoPosition } from '@/features/todos';
import { t } from '@/shared/i18n';
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
    ? t('todos:move.filtered')
    : ownList === undefined
      ? t('todos:move.loading')
      : null;
  const position = ownList === undefined ? -1 : getTodoPosition(ownList, todo.id, isGrouped);
  const lastPosition =
    ownList === undefined ? -1 : getListLength(ownList, todo.status, isGrouped) - 1;
  return [
    {
      id: 'move-top',
      label: t('todos:move.top'),
      disabledReason: unavailableReason ?? (position === 0 ? t('todos:move.atTop') : null),
      target: { kind: 'top' },
    },
    {
      id: 'move-bottom',
      label: t('todos:move.bottom'),
      disabledReason: unavailableReason ?? (position === lastPosition ? t('todos:move.atBottom') : null),
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
    entries.push({ id: 'move-backlog', label: t('todos:move.backlog'), disabledReason: null, target: { kind: 'backlog' } });
  }
  for (const sprint of sprints ?? []) {
    if (sprint.id === todo.sprintId || sprint.status === 'completed') continue;
    entries.push({
      id: `move-${sprint.id}`,
      label: sprint.status === 'active' ? t('todos:move.toActiveSprint', { name: sprint.name }) : t('todos:move.toSprint', { name: sprint.name }),
      disabledReason: null,
      target: { kind: 'sprint', sprint },
    });
  }
  return entries;
}
