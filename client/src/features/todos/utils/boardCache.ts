import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { boardKeys } from '@/features/board/api/keys';
import type { TodoMove } from '@/features/todos/utils/todoCache';
import { TODO_STATUSES } from '@/shared/types/api';
import type { SprintBoardResponse, Todo, TodoStatus } from '@/shared/types/api';

/** Cached boards of a project: `[queryKey, data]` pairs, as `getQueriesData` returns them. */
export type BoardSnapshot = [QueryKey, SprintBoardResponse | undefined][];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function mapColumns(
  columns: Record<TodoStatus, Todo[]>,
  change: (status: TodoStatus, todos: Todo[]) => Todo[],
): Record<TodoStatus, Todo[]> {
  const next = { ...columns };
  for (const status of TODO_STATUSES) next[status] = change(status, columns[status]);
  return next;
}

/**
 * The board after `move`, as new arrays (the input is never changed): the card leaves its
 * column when this board is the sprint it comes from, and enters the target column at
 * `position` when this board is the sprint it goes to. `completedAt` is left to the server.
 * A board of another sprint is returned as it is.
 */
export function applyMoveToBoard(board: SprintBoardResponse, move: TodoMove): SprintBoardResponse {
  const isSource = board.sprint.id === move.todo.sprintId;
  const isTarget = board.sprint.id === move.sprintId;
  if (!isSource && !isTarget) return board;

  const moved: Todo = {
    ...move.todo,
    sprintId: move.sprintId,
    status: move.status ?? move.todo.status,
  };
  const columns = mapColumns(board.columns, (status, todos) => {
    const rest = isSource ? todos.filter((todo) => todo.id !== move.todo.id) : todos;
    if (!isTarget || status !== moved.status) return rest;
    const insertAt = clamp(move.position, 0, rest.length);
    return [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)];
  });
  return { ...board, columns };
}

function isBoardOfProject(data: unknown, projectId: string): boolean {
  if (typeof data !== 'object' || data === null || !('sprint' in data)) return false;
  const { sprint } = data;
  return typeof sprint === 'object' && sprint !== null && 'projectId' in sprint && sprint.projectId === projectId;
}

/** The cached boards of one project, taken before an optimistic change. */
export function getBoardSnapshot(queryClient: QueryClient, projectId: string): BoardSnapshot {
  return queryClient.getQueriesData<SprintBoardResponse>({
    queryKey: boardKeys.all,
    predicate: (query) => isBoardOfProject(query.state.data, projectId),
  });
}

/** Applies the move to every cached board it touches. */
export function applyMoveToBoardCaches(
  queryClient: QueryClient,
  snapshot: BoardSnapshot,
  move: TodoMove,
): void {
  for (const [queryKey, data] of snapshot) {
    if (data === undefined) continue;
    const next = applyMoveToBoard(data, move);
    if (next !== data) queryClient.setQueryData<SprintBoardResponse>(queryKey, next);
  }
}

export function restoreBoardCaches(queryClient: QueryClient, snapshot: BoardSnapshot): void {
  for (const [queryKey, data] of snapshot) queryClient.setQueryData(queryKey, data);
}
