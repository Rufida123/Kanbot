import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ButtonHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

type DragHandleProps = {
  todoKey: string;
  /** What the handle does, as a verb: "Reorder" (lists) or "Move" (board). */
  /** What the handle does: reorder (lists) or move (board). */
  verb?: 'reorder' | 'move';
  /** When set the handle is disabled and the reason is shown (tooltip and accessible name). */
  disabledReason?: string | null;
  /** The `ref`, `attributes` and `listeners` of dnd-kit's `useSortable` (sortable rows only). */
  activatorRef?: (element: HTMLElement | null) => void;
  activatorProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;
};

/**
 * The only place a drag starts, so clicking a row (opens the details) never drags. A real
 * `<button>` with a visible focus ring from the theme; Space or Enter picks it up from the keyboard.
 */
export function DragHandle({
  todoKey,
  verb = 'reorder',
  disabledReason = null,
  activatorRef,
  activatorProps,
}: DragHandleProps) {
  const { t } = useTranslation();
  const verbText = t(`backlog:dnd.${verb}`);
  if (disabledReason !== null) {
    return (
      <Tooltip title={disabledReason}>
        <span>
          <IconButton
            size="small"
            disabled
            aria-label={t('backlog:dnd.handleUnavailable', { verb: verbText, key: todoKey, reason: disabledReason })}
          >
            <DragIndicatorIcon fontSize="small" aria-hidden="true" />
          </IconButton>
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={t(verb === 'move' ? 'backlog:dnd.handleTooltipMove' : 'backlog:dnd.handleTooltipReorder')}>
      <IconButton
        {...activatorProps}
        ref={activatorRef}
        size="small"
        aria-label={t('backlog:dnd.handleLabel', { verb: verbText, key: todoKey })}
        sx={{ cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
      >
        <DragIndicatorIcon fontSize="small" aria-hidden="true" />
      </IconButton>
    </Tooltip>
  );
}
