import { createContext, useContext } from 'react';
import type { TodoMenuAction } from '@/features/todos';
import type { Todo } from '@/shared/types/api';

/** Gives a row its "Move to…" menu entries without drilling props through the lists. */
export type MoveActionsGetter = (todo: Todo) => readonly TodoMenuAction[];

export const MoveActionsContext = createContext<MoveActionsGetter>(() => []);

export function useMoveActions(): MoveActionsGetter {
  return useContext(MoveActionsContext);
}
