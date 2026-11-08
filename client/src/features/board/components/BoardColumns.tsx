import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BoardColumn } from '@/features/board/components/BoardColumn';
import { BOARD_STATUSES } from '@/features/board/config/layout';
import { useBoardMoveActions } from '@/features/board/hooks/useBoardMoveActions';
import type { BoardColumns as BoardColumnsValue } from '@/features/board/utils/progress';
import { useTodoDialogParam } from '@/features/todos';
import { STATUS_LABELS } from '@/shared/config/constants';

type BoardColumnsProps = { projectId: string; columns: BoardColumnsValue };

/**
 * The columns. On phones they are swipeable with scroll snap and a column indicator; from `md` up
 * they sit side by side. Scrolling is direction-aware (RTL scroll offsets are negative).
 */
export function BoardColumns({ projectId, columns }: BoardColumnsProps) {
  const { t } = useTranslation();
  const { openTodo } = useTodoDialogParam();
  const getMenuActions = useBoardMoveActions(projectId, columns);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller === null) return;
    const onScroll = () => {
      const first = scroller.firstElementChild as HTMLElement | null;
      const step = (first?.offsetWidth ?? scroller.clientWidth) + 16;
      const index = Math.round(Math.abs(scroller.scrollLeft) / Math.max(step, 1));
      setCurrent(Math.min(Math.max(index, 0), BOARD_STATUSES.length - 1));
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  const currentStatus = BOARD_STATUSES[current] ?? BOARD_STATUSES[0];
  return (
    <>
      <Box
        ref={scrollerRef}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          overflowX: 'auto',
          width: '100%',
          paddingBlock: 2,
          scrollSnapType: { xs: 'x mandatory', md: 'none' },
          scrollbarWidth: 'thin',
          overscrollBehaviorX: 'contain',
        }}
      >
        {BOARD_STATUSES.map((status) => (
          <BoardColumn key={status} status={status} todos={columns[status]} getMenuActions={getMenuActions} onOpen={openTodo} />
        ))}
      </Box>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Box aria-hidden="true" sx={{ display: 'flex', gap: 0.75 }}>
          {BOARD_STATUSES.map((status, index) => (
            <Box key={status} sx={{ width: index === current ? '1.25rem' : '0.5rem', height: '0.5rem', borderRadius: '999px', backgroundColor: index === current ? 'primary.main' : 'divider', transition: (theme) => theme.transitions.create(['width', 'background-color']) }} />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" role="status">
          {t('board:column.position', { current: current + 1, total: BOARD_STATUSES.length, name: currentStatus ? STATUS_LABELS[currentStatus] : '' })}
        </Typography>
      </Box>
    </>
  );
}
