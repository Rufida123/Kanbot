import { useMutation } from '@tanstack/react-query';
import { generateTodos } from '@/features/ai/api/ai';
import { aiMutationKeys } from '@/features/ai/api/keys';
import { useAbortSignal } from '@/features/ai/hooks/useAbortSignal';
import type { GenerateTodosRequest } from '@/shared/types/api';

/** AI-2: asks for todo drafts. Nothing is saved; the dialog keeps the drafts in its own state. */
export function useGenerateTodos(projectId: string) {
  const { start } = useAbortSignal();
  return useMutation({
    mutationKey: aiMutationKeys.generateTodos(projectId),
    mutationFn: (request: GenerateTodosRequest) =>
      generateTodos({ projectId, request, signal: start() }),
  });
}
