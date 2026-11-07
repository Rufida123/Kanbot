import { AI_LIMITS } from '@/features/ai/config/limits';
import type { AiChatMessage } from '@/features/ai/store/aiChatStore';
import type { ChatMessage } from '@/shared/types/api';

/**
 * The body of the chat request: only `role` and `content` (never the local `id` or `sprintId`),
 * each content cut to the server limit (a saved summary can be longer), at most the newest 30
 * messages, and no assistant message at the start (the conversation must begin with the user).
 * The caller makes sure the last message is from the user.
 */
export function buildChatPayload(messages: readonly AiChatMessage[]): ChatMessage[] {
  const newest = messages.slice(-AI_LIMITS.conversationMax);
  const firstUserIndex = newest.findIndex((message) => message.role === 'user');
  if (firstUserIndex === -1) return [];
  return newest.slice(firstUserIndex).map((message) => ({
    role: message.role,
    content: message.content.slice(0, AI_LIMITS.messageMax),
  }));
}
