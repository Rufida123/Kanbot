import { arrayMove } from '@dnd-kit/sortable';
import { BOARD_STATUSES } from '@/features/board/config/layout';
import { isColumnId, parseColumnId, toColumnId } from '@/features/board/utils/boardContainers';
import type { ColumnId } from '@/features/board/utils/boardContainers';
import type { BoardColumns } from '@/features/board/utils/progress';
import type { Todo, TodoStatus } from '@/shared/types/api';

/** Ids of the cards in each column, in display order. Local drag state, never the cache. */
export type BoardPreview = Readonly<Record<string, readonly string[]>>;

export function toBoardPreview(columns: BoardColumns): BoardPreview {
  return Object.fromEntries(
    BOARD_STATUSES.map((status) => [toColumnId(status), columns[status].map((todo) => todo.id)]),
  );
}

/** The column that holds the id, or the column the id names. */
export function findColumn(preview: BoardPreview, id: string): ColumnId | undefined {
  if (isColumnId(id) && id in preview) return id;
  return Object.keys(preview).find((key): key is ColumnId => isColumnId(key) && preview[key]?.includes(id) === true);
}

/**
 * Cross-column preview while dragging: the active card leaves its column and enters the column
 * under the pointer, before or after the card it hovers. `null` = nothing to change.
 */
export function moveBetweenColumns(
  preview: BoardPreview,
  activeId: string,
  overId: string,
  isBelowOver: boolean,
): BoardPreview | null {
  const from = findColumn(preview, activeId);
  const to = findColumn(preview, overId);
  if (from === undefined || to === undefined || from === to) return null;
  const fromIds = preview[from] ?? [];
  const toIds = preview[to] ?? [];
  const overIndex = toIds.indexOf(overId);
  const insertAt = overIndex === -1 ? toIds.length : overIndex + (isBelowOver ? 1 : 0);
  return {
    ...preview,
    [from]: fromIds.filter((id) => id !== activeId),
    [to]: [...toIds.slice(0, insertAt), activeId, ...toIds.slice(insertAt)],
  };
}

export type BoardDrop = {
  todo: Todo;
  status: TodoStatus;
  /** Index in the target column after removing the card (0 = top). */
  position: number;
};

function findTodo(columns: BoardColumns, todoId: string): Todo | undefined {
  return BOARD_STATUSES.flatMap((status) => columns[status]).find((todo) => todo.id === todoId);
}

/**
 * The single request a drop means, or `null` when nothing changed (same column, same
 * position). `preview` is the state at drop time; `overId` is the card or column under it.
 */
export function resolveBoardDrop(params: {
  preview: BoardPreview;
  origin: TodoStatus;
  activeId: string;
  overId: string;
  columns: BoardColumns;
}): BoardDrop | null {
  const { preview, origin, activeId, overId, columns } = params;
  const target = findColumn(preview, activeId);
  const todo = findTodo(columns, activeId);
  if (target === undefined || todo === undefined) return null;

  let ids = preview[target] ?? [];
  if (overId !== activeId && findColumn(preview, overId) === target && !isColumnId(overId)) {
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1) ids = arrayMove([...ids], oldIndex, newIndex);
  }

  // The card is in `ids`, so its index is also its index after removing it from the column.
  const position = ids.indexOf(activeId);
  if (position === -1) return null;

  const status = parseColumnId(target);
  if (status === origin) {
    const originalIndex = columns[origin].findIndex((item) => item.id === activeId);
    if (originalIndex === position) return null;
  }
  return { todo, status, position };
}
