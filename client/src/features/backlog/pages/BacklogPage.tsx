
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { BacklogView } from '@/features/backlog/components/BacklogView';

/** `/projects/:projectId/backlog`. The page only composes; `ProjectGuard` guarantees the project exists. */
export default function BacklogPage() {
  const projectId = useParams()[PROJECT_ID_PARAM];
  if (projectId === undefined) return null;
  return <BacklogView projectId={projectId} />;
}
