import { skipToken, useQuery } from '@tanstack/react-query';
import { getBoard } from '@/features/board/api/board';
import { boardKeys } from '@/features/board/api/keys';
import { BOARD_STALE_TIME_MS } from '@/features/board/config/cache';
import type { ApiError } from '@/shared/api/client';
import type { SprintBoardResponse } from '@/shared/types/api';

/**
 * The board of a sprint (`undefined` keeps the query idle). The data stays in the query cache:
 * dragging changes it through `useMoveTodo`, never through a copy in component state.
 */
export function useBoard(sprintId: string | undefined) {
  return useQuery<SprintBoardResponse, ApiError>({
    queryKey: boardKeys.detail(sprintId ?? ''),
    queryFn: sprintId === undefined ? skipToken : ({ signal }) => getBoard(sprintId, signal),
    staleTime: BOARD_STALE_TIME_MS,
  });
}
