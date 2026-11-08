import { useNavigate, useParams } from 'react-router';
import { PROJECT_ID_PARAM, paths } from '@/app/navigation';
import { useHotkeys } from '@/shared/hooks/useHotkeys';
import { useUiStore } from '@/shared/stores/uiStore';

/** Registers the app-wide shortcuts. Renders nothing. */
export function GlobalShortcuts() {
  const navigate = useNavigate();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const requestCreateTodo = useUiStore((state) => state.requestCreateTodo);
  const requestFocusSearch = useUiStore((state) => state.requestFocusSearch);
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen);
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);

  const go = (getPath: (id: string) => string) => () => {
    if (projectId !== undefined) void navigate(getPath(projectId));
  };

  useHotkeys([
    { keys: 'k', mod: true, handler: () => setPaletteOpen(!useUiStore.getState().isPaletteOpen) },
    { keys: 'c', handler: () => (projectId === undefined ? undefined : requestCreateTodo()) },
    { keys: '/', handler: requestFocusSearch },
    { keys: '?', handler: () => setShortcutsOpen(true) },
    { keys: ['g', 'b'], handler: go((id) => paths.project(id).board) },
    { keys: ['g', 'l'], handler: go((id) => paths.project(id).backlog) },
    { keys: ['g', 's'], handler: go((id) => paths.project(id).sprints) },
  ]);
  return null;
}
