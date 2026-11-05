import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api/auth';
import { useSessionStore } from '@/shared/stores/sessionStore';

export function useLogin() {
  const startSession = useSessionStore((state) => state.startSession);
  return useMutation({
    mutationFn: login,
    onSuccess: startSession,
  });
}
