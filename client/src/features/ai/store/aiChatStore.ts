import { create } from 'zustand';
import type { ChatMessage } from '@/shared/types/api';

export type AiChatMessage = {
  /** Only a React key: the id never goes to the server. */
  id: string;
  role: ChatMessage['role'];
  content: string;
  /** Set on a sprint summary from the quick action: the bubble links to that sprint's board. */
  sprintId?: string;
};

export type NewChatMessage = Omit<AiChatMessage, 'id'>;

type AiChatState = {
  /** The project this conversation belongs to. */
  projectId: string | null;
  messages: readonly AiChatMessage[];
};

type AiChatActions = {
  /** Starts an empty conversation when the project changed. Does nothing for the same project. */
  openProject: (projectId: string) => void;
  /** Ignored when `projectId` is not the conversation's project: a late answer of an old project is dropped. */
  addMessage: (projectId: string, message: NewChatMessage) => void;
  /** "New chat" for the current project. */
  startNewChat: (projectId: string) => void;
  /** Back to the initial state. Called on logout: the conversation contains project data. */
  reset: () => void;
};

const initialState: AiChatState = { projectId: null, messages: [] };

/** Only the conversation lives here; backlog and sprint data stay in React Query. */
export const useAiChatStore = create<AiChatState & AiChatActions>()((set) => ({
  ...initialState,
  openProject: (projectId) =>
    set((state) => (state.projectId === projectId ? state : { projectId, messages: [] })),
  addMessage: (projectId, message) =>
    set((state) => {
      if (state.projectId !== projectId) return state;
      return { messages: [...state.messages, { ...message, id: crypto.randomUUID() }] };
    }),
  startNewChat: (projectId) => set({ projectId, messages: [] }),
  reset: () => set(initialState),
}));
