import { useMutation } from '@tanstack/react-query';
import { register } from '@/features/auth/api/auth';
import { useSessionStore } from '@/shared/stores/sessionStore';

export function useRegister() {
  const startSession = useSessionStore((state) => state.startSession);
  return useMutation({
    mutationFn: register,
    onSuccess: startSession,
  });
}
