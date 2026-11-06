import { createContext, useContext } from 'react';
import type { PreviewIds } from '@/features/backlog/utils/dragLogic';
import type { Todo } from '@/shared/types/api';

/** The list contents while a drag is in progress (or just dropped); `null` = show the cache. */
export type DragPreview = {
  previewIds: PreviewIds | null;
  todoById: ReadonlyMap<string, Todo>;
};

export const DragPreviewContext = createContext<DragPreview>({
  previewIds: null,
  todoById: new Map(),
});

/** The todos a list shows: the drag preview when there is one for it, otherwise `todos`. */
export function usePreviewedTodos(containerId: string, todos: readonly Todo[]): readonly Todo[] {
  const { previewIds, todoById } = useContext(DragPreviewContext);
  const ids = previewIds?.[containerId];
  if (ids === undefined) return todos;
  return ids.flatMap((id) => {
    const todo = todoById.get(id);
    return todo === undefined ? [] : [todo];
  });
}
