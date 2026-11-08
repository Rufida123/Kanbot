import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, matchPath, useLocation, useParams } from 'react-router';
import { paths, PROJECT_ID_PARAM, projectSegments } from '@/app/navigation';
import { useProject } from '@/features/projects';
import { useSprint } from '@/features/sprints';

type Crumb = { label: string; to?: string };

/** Projects › Project › Section (› Sprint). The last crumb is the current page. */
export function Breadcrumbs() {
  const { t } = useTranslation();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const { pathname } = useLocation();
  const { data: project } = useProject(projectId);
  const sprintMatch = matchPath({ path: `${paths.projectPattern}/${projectSegments.sprint}` }, pathname);
  const sprintId = sprintMatch?.params.sprintId;
  const { data: sprint } = useSprint(sprintId, projectId);
  const sectionMatch = matchPath({ path: `${paths.projectPattern}/:section/*` }, pathname);
  const section = sectionMatch?.params.section;
  const sectionLabels: Record<string, string> = {
    backlog: t('common:nav.backlog'),
    board: t('common:nav.board'),
    sprints: t('common:nav.sprints'),
    week: t('common:nav.week'),
  };

  const crumbs: Crumb[] = [{ label: t('common:app.projects'), to: projectId === undefined ? undefined : paths.projects }];
  if (projectId !== undefined) {
    crumbs.push({
      label: project?.name ?? t('common:app.projectFallback'),
      to: section === undefined ? undefined : paths.project(projectId).backlog,
    });
    if (section !== undefined) {
      const sectionLabel = sectionLabels[section] ?? section;
      const sectionPath = paths.project(projectId)[section as 'backlog'] as string | undefined;
      crumbs.push({ label: sectionLabel, to: sprintId === undefined ? undefined : sectionPath });
    }
    if (sprintId !== undefined) crumbs.push({ label: sprint?.name ?? t('misc.sprint', { ns: 'common' }) });
  }

  return (
    <MuiBreadcrumbs aria-label={t('common:nav.breadcrumbs')} maxItems={4} sx={{ minWidth: 0, '& ol': { flexWrap: 'nowrap' } }}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return crumb.to !== undefined && !isLast ? (
          <Link key={crumb.label + index} component={RouterLink} to={crumb.to} variant="body2" noWrap sx={{ maxWidth: '10rem' }}>
            {crumb.label}
          </Link>
        ) : (
          <Typography
            key={crumb.label + index}
            variant="subtitle2"
            component="span"
            noWrap
            title={crumb.label}
            aria-current={isLast ? 'page' : undefined}
            sx={{ maxWidth: '14rem' }}
            dir="auto"
          >
            {crumb.label}
          </Typography>
        );
      })}
    </MuiBreadcrumbs>
  );
}
