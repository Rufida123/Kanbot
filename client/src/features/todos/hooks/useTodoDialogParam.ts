import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { TODO_PARAM } from '@/app/navigation';

/** Marks history entries created by opening a todo from inside the app. */
const OPENED_BY_APP_STATE = { todoOpenedByApp: true } as const;

function isOpenedByApp(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'todoOpenedByApp' in state;
}

/**
 * The todo details dialog lives in the URL (`?todo=<id>`), next to the backlog filters.
 * Every update uses the functional form so the other params are kept.
 *
 * Opening pushes a history entry (Back closes the dialog). Closing from inside the app goes
 * back to the entry before it, so no duplicate page is left in the history; a dialog opened from
 * a pasted link has nothing to go back to and just drops the param.
 */
export function useTodoDialogParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const rawTodoId = searchParams.get(TODO_PARAM);
  const todoId = rawTodoId === null || rawTodoId.trim() === '' ? null : rawTodoId;
  const wasOpenedByApp = isOpenedByApp(state);

  const openTodo = useCallback(
    (id: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set(TODO_PARAM, id);
          return next;
        },
        { state: OPENED_BY_APP_STATE },
      );
    },
    [setSearchParams],
  );

  const closeTodo = useCallback(() => {
    if (wasOpenedByApp) {
      void navigate(-1);
      return;
    }
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(TODO_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [navigate, setSearchParams, wasOpenedByApp]);

  return { todoId, openTodo, closeTodo };
}
