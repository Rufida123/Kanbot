import { useEndOrigin } from '@/shared/hooks/useMenuOrigin';
import { useTranslation } from 'react-i18next';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useId, useState } from 'react';
import { useProjectDialogStore } from '@/features/projects/store/projectDialogStore';
import type { ProjectWithStats } from '@/shared/types/api';

type ProjectActionsMenuProps = {
  project: Pick<ProjectWithStats, 'id' | 'name'>;
  size?: 'small' | 'medium';
};

/** The ⋮ button with Edit and Delete. Used on cards and next to the sidebar switcher. */
export function ProjectActionsMenu({ project, size = 'medium' }: ProjectActionsMenuProps) {
  const origin = useEndOrigin();
  const { t } = useTranslation();
  const openEdit = useProjectDialogStore((state) => state.openEdit);
  const openDelete = useProjectDialogStore((state) => state.openDelete);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const isOpen = anchor !== null;

  const runAction = (action: (projectId: string, trigger: HTMLElement | null) => void) => {
    action(project.id, anchor);
    setAnchor(null);
  };

  return (
    <>
      <Tooltip title={t('projects:menu.actions')}>
        <IconButton
          id={buttonId}
          size={size}
          aria-label={t('projects:menu.actionsFor', { name: project.name })}
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
        anchorOrigin={origin.anchorOrigin}
        transformOrigin={origin.transformOrigin}
      >
        <MenuItem onClick={() => runAction(openEdit)}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" aria-hidden="true" />
          </ListItemIcon>
          {t('common:actions.edit')}
        </MenuItem>
        <MenuItem onClick={() => runAction(openDelete)}>
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" color="error" aria-hidden="true" />
          </ListItemIcon>
          {t('common:actions.delete')}
        </MenuItem>
      </Menu>
    </>
  );
}
