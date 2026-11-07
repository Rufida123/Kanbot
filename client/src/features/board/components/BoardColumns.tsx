import Box from '@mui/material/Box';
import { BoardColumn } from '@/features/board/components/BoardColumn';
import { BOARD_STATUSES } from '@/features/board/config/layout';
import { useBoardMoveActions } from '@/features/board/hooks/useBoardMoveActions';
import type { BoardColumns as BoardColumnsValue } from '@/features/board/utils/progress';
import { useTodoDialogParam } from '@/features/todos';

type BoardColumnsProps = { projectId: string; columns: BoardColumnsValue };

/** The four columns side by side. This is the horizontal scroll area (768px), never the page. */
export function BoardColumns({ projectId, columns }: BoardColumnsProps) {
  const { openTodo } = useTodoDialogParam();
  const getMenuActions = useBoardMoveActions(projectId, columns);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, overflowX: 'auto', width: '100%', paddingBlock: 2 }}>
      {BOARD_STATUSES.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          todos={columns[status]}
          getMenuActions={getMenuActions}
          onOpen={openTodo}
        />
      ))}
    </Box>
  );
}
