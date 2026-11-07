import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ButtonHTMLAttributes } from 'react';

type DragHandleProps = {
  todoKey: string;
  /** What the handle does, as a verb: "Reorder" (lists) or "Move" (board). */
  verb?: string;
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
  verb = 'Reorder',
  disabledReason = null,
  activatorRef,
  activatorProps,
}: DragHandleProps) {
  if (disabledReason !== null) {
    return (
      <Tooltip title={disabledReason}>
        <span>
          <IconButton
            size="small"
            disabled
            aria-label={`${verb} ${todoKey} (unavailable: ${disabledReason})`}
          >
            <DragIndicatorIcon fontSize="small" aria-hidden="true" />
          </IconButton>
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={`Drag to ${verb.toLowerCase()}, or press Space`}>
      <IconButton
        {...activatorProps}
        ref={activatorRef}
        size="small"
        aria-label={`${verb} ${todoKey}`}
        sx={{ cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
      >
        <DragIndicatorIcon fontSize="small" aria-hidden="true" />
      </IconButton>
    </Tooltip>
  );
}
