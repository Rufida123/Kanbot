import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BrightnessMediumIcon from '@mui/icons-material/BrightnessMedium';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import HistoryIcon from '@mui/icons-material/History';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM, TODO_PARAM } from '@/app/navigation';
import { useAiDialogStore } from '@/features/ai';
import { useProjectDialogStore, useProjects } from '@/features/projects';
import { useSprints } from '@/features/sprints';
import { listTodos } from '@/features/todos/api/todos';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import { setLanguage } from '@/shared/i18n';
import type { Language } from '@/shared/i18n';
import { addRecentItem, getRecentItems } from '@/shared/lib/recentItems';
import { useUiStore } from '@/shared/stores/uiStore';
import { fuzzyFilter } from '@/shared/utils/fuzzy';

type PaletteItem = {
  id: string;
  group: 'recent' | 'actions' | 'pages' | 'projects' | 'sprints' | 'todos';
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
};

const GROUP_ORDER: PaletteItem['group'][] = ['recent', 'actions', 'pages', 'projects', 'sprints', 'todos'];
const MAX_PER_GROUP = 6;

/** Ctrl/Cmd + K (enhancement 3): fuzzy search over projects, todos, sprints and actions. */
export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const isOpen = useUiStore((state) => state.isPaletteOpen);
  const setOpen = useUiStore((state) => state.setPaletteOpen);
  const requestCreateTodo = useUiStore((state) => state.requestCreateTodo);
  const navigate = useNavigate();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const fullScreen = useIsSmallScreen();
  const { setMode } = useColorScheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const titleId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const debounced = useDebouncedValue(query.trim(), 250);

  const { data: projects } = useProjects();
  const { data: sprints } = useSprints(isOpen ? projectId : undefined);
  const { data: todoHits } = useQuery({
    queryKey: ['palette-todos', projectId, debounced],
    queryFn: ({ signal }) => listTodos(projectId ?? '', { search: debounced }, signal),
    enabled: isOpen && projectId !== undefined && debounced.length >= 2,
    staleTime: 15_000,
  });

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };
  const go = (path: string) => () => void navigate(path);

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    const nextLanguage: Language = i18n.language.startsWith('ar') ? 'en' : 'ar';
    if (projectId !== undefined) {
      list.push(
        { id: 'a-create', group: 'actions', label: t('common:palette.createTodo'), hint: 'c', icon: <AddIcon />, run: () => { void navigate(paths.project(projectId).backlog); requestCreateTodo(); } },
        { id: 'a-generate', group: 'actions', label: t('common:palette.generateAi'), icon: <AutoAwesomeIcon />, run: () => useAiDialogStore.getState().openGenerateTodos(null) },
        { id: 'a-plan', group: 'actions', label: t('common:palette.planSprint'), icon: <PlaylistAddIcon />, run: () => useAiDialogStore.getState().openPlanSprint(null) },
      );
      const project = paths.project(projectId);
      list.push(
        { id: 'p-backlog', group: 'pages', label: t('common:nav.backlog'), hint: 'g l', icon: <ListAltIcon />, run: go(project.backlog) },
        { id: 'p-board', group: 'pages', label: t('common:nav.board'), hint: 'g b', icon: <ViewKanbanOutlinedIcon />, run: go(project.board) },
        { id: 'p-sprints', group: 'pages', label: t('common:nav.sprints'), hint: 'g s', icon: <SpeedIcon />, run: go(project.sprints) },
        { id: 'p-week', group: 'pages', label: t('common:nav.week'), icon: <ListAltIcon />, run: go(project.week) },
      );
    }
    list.push({ id: 'a-project', group: 'actions', label: t('common:palette.newProject'), icon: <FolderOutlinedIcon />, run: () => useProjectDialogStore.getState().openCreate(null) });
    for (const mode of ['light', 'dark', 'system'] as const) {
      list.push({ id: `a-theme-${mode}`, group: 'actions', label: t('common:palette.theme', { mode: t(`common:theme.${mode}`) }), icon: <BrightnessMediumIcon />, run: () => setMode(mode) });
    }
    list.push({ id: 'a-language', group: 'actions', label: t('common:palette.languageTo', { language: t(`common:language.${nextLanguage}`, { lng: nextLanguage }) }), icon: <TranslateIcon />, run: () => setLanguage(nextLanguage) });
    for (const project of projects ?? []) {
      list.push({ id: `pr-${project.id}`, group: 'projects', label: project.name, hint: project.key, icon: <FolderOutlinedIcon />, run: () => { addRecentItem({ kind: 'project', id: project.id, projectId: project.id, title: project.name, path: paths.project(project.id).backlog }); void navigate(paths.project(project.id).backlog); } });
    }
    for (const sprint of sprints ?? []) {
      const path = paths.project(sprint.projectId).sprint(sprint.id);
      list.push({ id: `sp-${sprint.id}`, group: 'sprints', label: sprint.name, hint: t(`common:sprintStatus.${sprint.status}`), icon: <SpeedIcon />, run: () => { addRecentItem({ kind: 'sprint', id: sprint.id, projectId: sprint.projectId, title: sprint.name, path }); void navigate(path); } });
    }
    for (const todo of todoHits ?? []) {
      const path = `${paths.project(todo.projectId).backlog}?${TODO_PARAM}=${todo.id}`;
      list.push({ id: `td-${todo.id}`, group: 'todos', label: `${todo.key} ${todo.title}`, icon: <TaskAltOutlinedIcon />, run: () => { addRecentItem({ kind: 'todo', id: todo.id, projectId: todo.projectId, title: `${todo.key} ${todo.title}`, path }); void navigate(path); } });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language, projectId, projects, sprints, todoHits, setMode, navigate, requestCreateTodo]);

  const visible = useMemo(() => {
    if (query.trim() === '') {
      const recent: PaletteItem[] = getRecentItems().map((item) => ({
        id: `rc-${item.kind}-${item.id}`,
        group: 'recent',
        label: item.title,
        icon: <HistoryIcon />,
        run: () => void navigate(item.path),
      }));
      return [...recent, ...items.filter((item) => item.group === 'actions' || item.group === 'pages')];
    }
    const found = fuzzyFilter(items, query, (item) => item.label);
    const counts = new Map<string, number>();
    return found.filter((item) => {
      const next = (counts.get(item.group) ?? 0) + 1;
      counts.set(item.group, next);
      return next <= MAX_PER_GROUP;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, isOpen]);

  const grouped = GROUP_ORDER.map((group) => ({ group, entries: visible.filter((item) => item.group === group) })).filter((entry) => entry.entries.length > 0);
  const flat = grouped.flatMap((entry) => entry.entries);
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((activeIndex + 1) % Math.max(flat.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((activeIndex - 1 + flat.length) % Math.max(flat.length, 1));
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const item = flat[activeIndex];
      if (item) {
        close();
        item.run();
      }
    }
  };

  let runningIndex = -1;
  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="sm" fullScreen={fullScreen} aria-labelledby={titleId} slotProps={{ paper: { sx: { alignSelf: fullScreen ? undefined : 'flex-start', marginBlockStart: fullScreen ? 0 : '12vh' } } }}>
      <Typography id={titleId} component="h2" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {t('common:palette.title')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingInline: 2, borderBottom: 1, borderColor: 'divider' }}>
        <SearchIcon color="action" aria-hidden="true" />
        <InputBase
          autoFocus
          fullWidth
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActive(0); }}
          onKeyDown={handleKeyDown}
          placeholder={t('common:palette.placeholder')}
          inputProps={{ role: 'combobox', 'aria-expanded': true, 'aria-controls': listId, 'aria-activedescendant': flat[activeIndex] ? `${listId}-${flat[activeIndex].id}` : undefined, 'aria-label': t('common:palette.title'), 'aria-autocomplete': 'list' }}
          sx={{ paddingBlock: 1.5 }}
        />
      </Box>
      <Box component="ul" id={listId} role="listbox" ref={listRef} aria-label={t('common:palette.title')} sx={{ listStyle: 'none', maxHeight: fullScreen ? 'none' : '50vh', flex: fullScreen ? 1 : undefined, overflow: 'auto', paddingBlock: 1 }}>
        {flat.length === 0 ? (
          <Typography role="status" variant="body2" color="text.secondary" sx={{ padding: 3, textAlign: 'center' }}>
            {t('common:palette.noResults')}
          </Typography>
        ) : null}
        {grouped.map(({ group, entries }) => (
          <Box component="li" key={group} role="presentation">
            <Typography variant="caption" color="text.secondary" role="presentation" sx={{ display: 'block', paddingInline: 2, paddingBlock: 0.75, fontWeight: 'fontWeightMedium' }}>
              {t(`common:palette.${group}`)}
            </Typography>
            <Box component="ul" role="group" aria-label={t(`common:palette.${group}`)} sx={{ listStyle: 'none' }}>
              {entries.map((item) => {
                runningIndex += 1;
                const index = runningIndex;
                const isActive = index === activeIndex;
                return (
                  <Box
                    component="li"
                    key={item.id}
                    id={`${listId}-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => setActive(index)}
                    onClick={() => { close(); item.run(); }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, paddingInline: 2, paddingBlock: 1, minHeight: '2.75rem', cursor: 'pointer', backgroundColor: isActive ? 'action.selected' : 'transparent' }}
                  >
                    <Box aria-hidden="true" sx={{ display: 'flex', color: 'text.secondary' }}>{item.icon}</Box>
                    <Typography variant="body2" dir="auto" noWrap sx={{ flex: 1, minWidth: 0 }}>{item.label}</Typography>
                    {item.hint ? <Typography variant="caption" color="text.secondary" dir="ltr">{item.hint}</Typography> : null}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ padding: 1.5, borderTop: 1, borderColor: 'divider', display: { xs: 'none', sm: 'block' } }}>
        {t('common:palette.navHint')}
      </Typography>
    </Dialog>
  );
}
