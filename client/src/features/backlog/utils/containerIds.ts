/** Every list that can hold a dragged todo: the backlog or one planned sprint. */
export type ContainerId = 'backlog' | `sprint:${string}`;

export const BACKLOG_CONTAINER_ID: ContainerId = 'backlog';

const SPRINT_PREFIX = 'sprint:';

/** `null` (no sprint) is the backlog. Container ids are never built by hand elsewhere. */
export function toContainerId(sprintId: string | null): ContainerId {
  return sprintId === null ? BACKLOG_CONTAINER_ID : `${SPRINT_PREFIX}${sprintId}`;
}

/** The sprint id of a container, `null` for the backlog. */
export function parseContainerId(containerId: ContainerId): string | null {
  return containerId === BACKLOG_CONTAINER_ID ? null : containerId.slice(SPRINT_PREFIX.length);
}

export function isContainerId(value: unknown): value is ContainerId {
  return (
    typeof value === 'string' &&
    (value === BACKLOG_CONTAINER_ID || (value.startsWith(SPRINT_PREFIX) && value.length > SPRINT_PREFIX.length))
  );
}

/** What `useSortable({ data })` carries; dnd-kit types `data.current` loosely, so it is checked. */
export type SortableData = { containerId: ContainerId };

export function isSortableData(value: unknown): value is SortableData {
  return typeof value === 'object' && value !== null && 'containerId' in value && isContainerId(value.containerId);
}
