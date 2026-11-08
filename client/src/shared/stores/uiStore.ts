import { create } from 'zustand';

type UiState = {
  /** The AI assistant drawer. */
  assistantOpen: boolean;
  /** The temporary navigation drawer below the desktop breakpoint. */
  isMobileNavOpen: boolean;
  isPaletteOpen: boolean;
  isShortcutsOpen: boolean;
  /** Increments when "create todo" is requested (`c`, palette). The backlog focuses its quick-create. */
  createTodoSignal: number;
  /** Increments when "focus search" is requested (`/`). */
  focusSearchSignal: number;
};

type UiActions = {
  setAssistantOpen: (isOpen: boolean) => void;
  setMobileNavOpen: (isOpen: boolean) => void;
  setPaletteOpen: (isOpen: boolean) => void;
  setShortcutsOpen: (isOpen: boolean) => void;
  requestCreateTodo: () => void;
  requestFocusSearch: () => void;
  /** Back to the initial state. Called on logout. */
  reset: () => void;
};

const initialState: UiState = {
  assistantOpen: false,
  isMobileNavOpen: false,
  isPaletteOpen: false,
  isShortcutsOpen: false,
  createTodoSignal: 0,
  focusSearchSignal: 0,
};

export const useUiStore = create<UiState & UiActions>()((set) => ({
  ...initialState,
  setAssistantOpen: (isOpen) => set({ assistantOpen: isOpen }),
  setMobileNavOpen: (isOpen) => set({ isMobileNavOpen: isOpen }),
  setPaletteOpen: (isOpen) => set({ isPaletteOpen: isOpen }),
  setShortcutsOpen: (isOpen) => set({ isShortcutsOpen: isOpen }),
  requestCreateTodo: () => set((state) => ({ createTodoSignal: state.createTodoSignal + 1 })),
  requestFocusSearch: () => set((state) => ({ focusSearchSignal: state.focusSearchSignal + 1 })),
  reset: () => set(initialState),
}));
