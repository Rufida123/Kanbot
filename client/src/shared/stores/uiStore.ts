import { create } from 'zustand';

type UiState = {
  /** The AI assistant drawer (its content arrives in Sprint 6). */
  assistantOpen: boolean;
  /** The temporary navigation drawer below the desktop breakpoint. */
  isMobileNavOpen: boolean;
};

type UiActions = {
  setAssistantOpen: (isOpen: boolean) => void;
  setMobileNavOpen: (isOpen: boolean) => void;
  /** Back to the initial state. Called on logout. */
  reset: () => void;
};

const initialState: UiState = { assistantOpen: false, isMobileNavOpen: false };

export const useUiStore = create<UiState & UiActions>()((set) => ({
  ...initialState,
  setAssistantOpen: (isOpen) => set({ assistantOpen: isOpen }),
  setMobileNavOpen: (isOpen) => set({ isMobileNavOpen: isOpen }),
  reset: () => set(initialState),
}));
