import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM } from '@/app/navigation';
import { todoKeys } from '@/features/todos/api/keys';
import { listTodos } from '@/features/todos/api/todos';
import { TodoList } from '@/features/todos/components/TodoList';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { getWeekDays } from '@/shared/utils/dueDate';
import { formatCount } from '@/shared/utils/formatCount';
import { formatWeekday, getTodayDateOnly } from '@/shared/utils/formatDate';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { Link as RouterLink } from 'react-router';
import Button from '@mui/material/Button';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

/** "My week" (enhancement 8): todos due this week (Monday to Sunday), grouped by day, plus overdue ones. */
export default function WeekPage() {
  const { t } = useTranslation();
  const projectId = useParams()[PROJECT_ID_PARAM] ?? '';
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...todoKeys.all(projectId), 'week'],
    queryFn: ({ signal }) => listTodos(projectId, {}, signal),
    staleTime: 30_000,
  });
  const today = getTodayDateOnly();
  const days = getWeekDays(today);

  if (isPending) return <Skeleton variant="rounded" height={240} aria-label={t('common:app.loading')} />;
  if (isError) return <ErrorState title={t('todos:week.loadError')} message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const open = data.filter((todo) => todo.dueDate !== null && todo.status !== 'done');
  const overdue = open.filter((todo) => (todo.dueDate ?? '') < today);
  const sections = [
    ...(overdue.length > 0 ? [{ id: 'overdue', title: t('todos:week.overdue'), todos: overdue }] : []),
    ...days.map((day) => ({ id: day, title: day === today ? `${t('common:dates.today')} · ${formatWeekday(day)}` : formatWeekday(day), todos: open.filter((todo) => todo.dueDate === day) })),
  ];
  const hasAny = sections.some((section) => section.todos.length > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h2">{t('todos:week.title')}</Typography>
        <Typography color="text.secondary">{t('todos:week.subtitle')}</Typography>
      </Box>
      {hasAny ? (
        sections.map((section) => (
          <Box component="section" key={section.id} aria-labelledby={`week-${section.id}`}>
            <Typography id={`week-${section.id}`} component="h2" variant="h4" sx={{ marginBottom: 1, color: section.id === 'overdue' ? 'error.main' : undefined }}>
              {section.title} <Typography component="span" variant="caption" color="text.secondary">{formatCount(section.todos.length, 'todo')}</Typography>
            </Typography>
            {section.todos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">{t('todos:week.noTodos')}</Typography>
            ) : (
              <TodoList todos={section.todos} label={section.title} />
            )}
          </Box>
        ))
      ) : (
        <EmptyState
          icon={<EventAvailableOutlinedIcon fontSize="large" />}
          title={t('todos:week.emptyTitle')}
          message={t('todos:week.emptyMessage')}
          action={<Button component={RouterLink} to={paths.project(projectId).backlog} variant="outlined">{t('todos:week.openBacklog')}</Button>}
        />
      )}
    </Box>
  );
}
