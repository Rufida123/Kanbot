import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useId, useState } from 'react';
import type { Todo } from '@/shared/types/api';

/** An extra menu entry, for example "Move to top". A reason makes it disabled and visible. */
export type TodoMenuAction = {
  id: string;
  label: string;
  /** Why the action is unavailable; shown under the label. `null` = available. */
  disabledReason: string | null;
  onSelect: () => void;
};

type TodoActionsMenuProps = {
  todo: Pick<Todo, 'id' | 'key' | 'title'>;
  onOpen: (todoId: string) => void;
  /** Omitted: the menu has no Delete entry (the board and read-only views). */
  onDelete?: (todoId: string) => void;
  /** The "Move to…" entries (Sprint 4), shown between Open and Delete. */
  extraActions?: readonly TodoMenuAction[];
};

/** The ⋮ button of a row: Open, the move actions it is given, and Delete (when `onDelete` is given). */
export function TodoActionsMenu({ todo, onOpen, onDelete, extraActions = [] }: TodoActionsMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const isOpen = anchor !== null;

  const runAction = (action: (todoId: string) => void) => {
    setAnchor(null);
    action(todo.id);
  };

  return (
    <>
      <Tooltip title="Todo actions">
        <IconButton
          id={buttonId}
          size="small"
          aria-label={`Actions for ${todo.key} ${todo.title}`}
          aria-haspopup="menu"
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen}
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <MoreVertIcon fontSize="small" aria-hidden="true" />
        </IconButton>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={isOpen}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { 'aria-labelledby': buttonId } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => runAction(onOpen)}>
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" aria-hidden="true" />
          </ListItemIcon>
          Open
        </MenuItem>
        {extraActions.length > 0 ? <Divider component="li" role="separator" /> : null}
        {extraActions.map((action) => (
          <MenuItem
            key={action.id}
            disabled={action.disabledReason !== null}
            onClick={() => {
              setAnchor(null);
              action.onSelect();
            }}
          >
            <ListItemText inset secondary={action.disabledReason}>
              {action.label}
            </ListItemText>
          </MenuItem>
        ))}
        {onDelete !== undefined && extraActions.length > 0 ? (
          <Divider component="li" role="separator" />
        ) : null}
        {onDelete === undefined ? null : (
          <MenuItem onClick={() => runAction(onDelete)}>
            <ListItemIcon>
              <DeleteOutlinedIcon fontSize="small" color="error" aria-hidden="true" />
            </ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
