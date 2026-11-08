import { createContext, useContext } from 'react';

export type Selection = {
  isActive: boolean;
  selectedIds: ReadonlySet<string>;
  toggle: (todoId: string) => void;
};

export const SelectionContext = createContext<Selection>({ isActive: false, selectedIds: new Set(), toggle: () => undefined });

export function useSelection(): Selection {
  return useContext(SelectionContext);
}
