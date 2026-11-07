import { BOARD_STATUSES } from '@/features/board/config/layout';
import type { TodoStatus } from '@/shared/types/api';

/** The droppable id of a board column. Column ids are never built by hand elsewhere. */
export type ColumnId = `column:${TodoStatus}`;

const COLUMN_PREFIX = 'column:';

export function toColumnId(status: TodoStatus): ColumnId {
  return `${COLUMN_PREFIX}${status}`;
}

export function isColumnId(value: unknown): value is ColumnId {
  return typeof value === 'string' && BOARD_STATUSES.some((status) => toColumnId(status) === value);
}

/** The status a column id stands for. */
export function parseColumnId(columnId: ColumnId): TodoStatus {
  const status = BOARD_STATUSES.find((item) => toColumnId(item) === columnId);
  // `ColumnId` only holds known statuses, so this is unreachable; the fallback keeps types honest.
  return status ?? 'todo';
}

/** What `useSortable({ data })` carries on a card; dnd-kit types `data.current` loosely, so it is checked. */
export type BoardSortableData = { columnId: ColumnId };

export function isBoardSortableData(value: unknown): value is BoardSortableData {
  return typeof value === 'object' && value !== null && 'columnId' in value && isColumnId(value.columnId);
}
