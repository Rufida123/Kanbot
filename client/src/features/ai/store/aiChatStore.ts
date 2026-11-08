import { create } from 'zustand';
import { getPreference, setPreference } from '@/shared/lib/preferences';
import type { StoredChatMessage } from '@/shared/lib/preferences';
import type { ChatMessage } from '@/shared/types/api';

export type AiChatMessage = {
  id: string;
  role: ChatMessage['role'];
  content: string;
  sprintId?: string;
  /** A fresh assistant answer: the typewriter effect plays once (never for history). */
  isNew?: boolean;
};

export type NewChatMessage = Omit<AiChatMessage, 'id'>;

/** Messages kept per project in `preferences.ts` (enhancement 18). */
export const CHAT_HISTORY_MAX = 30;

type AiChatState = {
  projectId: string | null;
  messages: readonly AiChatMessage[];
};

type AiChatActions = {
  /** Switching project loads that project's saved history (or an empty chat). */
  openProject: (projectId: string) => void;
  addMessage: (projectId: string, message: NewChatMessage) => void;
  /** The typewriter finished (or was skipped): the message becomes plain history. */
  markSettled: (messageId: string) => void;
  /** Clears the current chat AND its saved history. */
  startNewChat: (projectId: string) => void;
  /** Removes the saved history of every project. */
  clearAllHistory: () => void;
  /** Back to the initial state. Called on logout (saved history is cleared by `clearUserPreferences`). */
  reset: () => void;
};

const initialState: AiChatState = { projectId: null, messages: [] };

function loadHistory(projectId: string): AiChatMessage[] {
  const stored = getPreference('chatHistory')?.[projectId] ?? [];
  return stored.slice(-CHAT_HISTORY_MAX).map((message) => ({ ...message, id: crypto.randomUUID() }));
}

function saveHistory(projectId: string, messages: readonly AiChatMessage[]): void {
  const all = { ...(getPreference('chatHistory') ?? {}) };
  const stored: StoredChatMessage[] = messages.slice(-CHAT_HISTORY_MAX).map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.sprintId !== undefined && { sprintId: message.sprintId }),
  }));
  if (stored.length === 0) delete all[projectId];
  else all[projectId] = stored;
  setPreference('chatHistory', Object.keys(all).length === 0 ? undefined : all);
}

export const useAiChatStore = create<AiChatState & AiChatActions>()((set) => ({
  ...initialState,
  openProject: (projectId) =>
    set((state) => (state.projectId === projectId ? state : { projectId, messages: loadHistory(projectId) })),
  addMessage: (projectId, message) =>
    set((state) => {
      if (state.projectId !== projectId) return state;
      const messages = [...state.messages, { ...message, id: crypto.randomUUID() }].slice(-CHAT_HISTORY_MAX);
      saveHistory(projectId, messages);
      return { messages };
    }),
  markSettled: (messageId) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === messageId ? { ...message, isNew: false } : message)),
    })),
  startNewChat: (projectId) => {
    saveHistory(projectId, []);
    set({ projectId, messages: [] });
  },
  clearAllHistory: () => {
    setPreference('chatHistory', undefined);
    set({ messages: [] });
  },
  reset: () => set(initialState),
}));
