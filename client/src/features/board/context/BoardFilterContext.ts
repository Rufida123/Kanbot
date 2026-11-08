import { createContext, useContext } from 'react';

/** Label highlighted on the board: cards without it are dimmed (positions stay correct for drag and drop). */
export const BoardFilterContext = createContext<string | null>(null);

export function useBoardLabelFilter(): string | null {
  return useContext(BoardFilterContext);
}
