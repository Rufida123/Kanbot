import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useId, useState } from 'react';
import type { Todo } from '@/shared/types/api';

type TodoActionsMenuProps = {
  todo: Pick<Todo, 'id' | 'key' | 'title'>;
  onOpen: (todoId: string) => void;
  onDelete: (todoId: string) => void;
};

/** The ⋮ button of a row: Open and Delete (Sprint 4 adds the "Move to…" items here). */
export function TodoActionsMenu({ todo, onOpen, onDelete }: TodoActionsMenuProps) {
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
        <MenuItem onClick={() => runAction(onDelete)}>
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" color="error" aria-hidden="true" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
