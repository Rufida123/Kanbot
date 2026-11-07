import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { sendChat } from '@/features/ai/api/ai';
import { aiMutationKeys } from '@/features/ai/api/keys';
import { useAbortSignal } from '@/features/ai/hooks/useAbortSignal';
import { useAiChatStore } from '@/features/ai/store/aiChatStore';
import { buildChatPayload } from '@/features/ai/utils/buildChatPayload';
import type { ChatMessage, ChatResponse } from '@/shared/types/api';

type ChatVariables = { messages: ChatMessage[]; signal: AbortSignal };

/**
 * The send flow of the assistant chat. The conversation lives in `aiChatStore`; the answer is
 * appended in the mutation's own `onSuccess` (a callback passed to `mutate()` would be lost if the
 * component unmounted). The request is cancelled when the project changes or the panel unmounts,
 * and the result or error of a cancelled request is ignored. The user's message stays in the
 * conversation when the call fails, so "Try again" just sends the same conversation again.
 */
export function useChat(projectId: string) {
  const { start, abort } = useAbortSignal();
  const inFlightSignalRef = useRef<AbortSignal | null>(null);

  const mutation = useMutation<ChatResponse, unknown, ChatVariables>({
    mutationKey: aiMutationKeys.chat(projectId),
    mutationFn: ({ messages, signal }) => sendChat({ projectId, messages, signal }),
    onSuccess: (response, { signal }) => {
      if (signal.aborted) return;
      useAiChatStore.getState().addMessage(projectId, {
        role: 'assistant',
        content: response.message.content,
      });
    },
    onSettled: (_response, _error, { signal }) => {
      if (inFlightSignalRef.current === signal) inFlightSignalRef.current = null;
    },
  });
  const { reset: resetMutation } = mutation;

  const reset = () => {
    abort();
    inFlightSignalRef.current = null;
    resetMutation();
  };

  // The drawer outlives the project pages: a project change drops the request in flight.
  useEffect(
    () => () => {
      abort();
      inFlightSignalRef.current = null;
      resetMutation();
    },
    [projectId, abort, resetMutation],
  );

  const isBusy = (): boolean => {
    const signal = inFlightSignalRef.current;
    return signal !== null && !signal.aborted;
  };

  const dispatch = () => {
    const { projectId: chatProjectId, messages } = useAiChatStore.getState();
    if (chatProjectId !== projectId) return;
    const payload = buildChatPayload(messages);
    if (payload.length === 0) return;
    const signal = start();
    inFlightSignalRef.current = signal;
    mutation.mutate({ messages: payload, signal });
  };

  /** Appends the user's message and asks for the answer. Returns false when nothing was sent. */
  const sendMessage = (content: string): boolean => {
    const text = content.trim();
    if (text === '' || isBusy()) return false;
    const chat = useAiChatStore.getState();
    chat.openProject(projectId);
    chat.addMessage(projectId, { role: 'user', content: text });
    dispatch();
    return true;
  };

  /** Sends the same conversation again (after an error). */
  const retry = () => {
    if (!isBusy()) dispatch();
  };

  const isIgnoredError = mutation.variables?.signal.aborted === true;
  return {
    sendMessage,
    retry,
    reset,
    isPending: mutation.isPending,
    error: mutation.isError && !isIgnoredError ? mutation.error : null,
  };
}
