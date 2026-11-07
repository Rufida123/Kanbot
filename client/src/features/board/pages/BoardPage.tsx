import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { BoardView } from '@/features/board/components/BoardView';

/** `/projects/:projectId/board`. The page only composes; `ProjectGuard` guarantees the project exists. */
export default function BoardPage() {
  const projectId = useParams()[PROJECT_ID_PARAM];
  if (projectId === undefined) return null;
  return <BoardView projectId={projectId} />;
}
