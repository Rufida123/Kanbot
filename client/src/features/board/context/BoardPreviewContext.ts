import { createContext, useContext } from 'react';
import { toColumnId } from '@/features/board/utils/boardContainers';
import type { BoardPreview } from '@/features/board/utils/boardDragLogic';
import type { Todo, TodoStatus } from '@/shared/types/api';

/** The column contents while a drag is in progress (or just dropped); `null` = show the cache. */
export type BoardPreviewValue = {
  previewIds: BoardPreview | null;
  todoById: ReadonlyMap<string, Todo>;
  /** True from pick-up to drop: empty columns then show their drop hint. */
  isDragging: boolean;
};

export const BoardPreviewContext = createContext<BoardPreviewValue>({
  previewIds: null,
  todoById: new Map(),
  isDragging: false,
});

export function useBoardPreview(): BoardPreviewValue {
  return useContext(BoardPreviewContext);
}

/** The cards a column shows: the drag preview when there is one for it, otherwise `todos`. */
export function usePreviewedColumn(status: TodoStatus, todos: readonly Todo[]): readonly Todo[] {
  const { previewIds, todoById } = useBoardPreview();
  const ids = previewIds?.[toColumnId(status)];
  if (ids === undefined) return todos;
  return ids.flatMap((id) => {
    const todo = todoById.get(id);
    return todo === undefined ? [] : [todo];
  });
}
