import { AI_LIMITS } from '@/features/ai/config/limits';
import type { AiChatMessage } from '@/features/ai/store/aiChatStore';
import { withLanguageHint } from '@/features/ai/utils/languageHint';
import type { ChatMessage } from '@/shared/types/api';

/**
 * What is sent to the chat endpoint: the newest messages, starting with a user message, each cut
 * to the API limit. The LAST user message carries the language hint ("Answer in Arabic.").
 */
export function buildChatPayload(messages: readonly AiChatMessage[], language?: string): ChatMessage[] {
  const newest = messages.slice(-AI_LIMITS.conversationMax);
  const firstUserIndex = newest.findIndex((message) => message.role === 'user');
  if (firstUserIndex === -1) return [];
  const payload = newest.slice(firstUserIndex).map((message) => ({
    role: message.role,
    content: message.content.slice(0, AI_LIMITS.messageMax),
  }));
  const lastIndex = payload.length - 1;
  const last = payload[lastIndex];
  if (last !== undefined && last.role === 'user') {
    payload[lastIndex] = { role: 'user', content: withLanguageHint(last.content, AI_LIMITS.messageMax, language) };
  }
  return payload;
}
