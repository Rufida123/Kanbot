import { useEndOrigin, useStartOrigin } from '@/shared/hooks/useMenuOrigin';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useId, useState } from 'react';
import { signOut } from '@/features/auth/utils/signOut';
import { getInitials } from '@/features/auth/utils/getInitials';
import { useSessionStore } from '@/shared/stores/sessionStore';

type UserMenuProps = {
  /** `top-start`: full-width button whose menu opens upwards (bottom of the sidebar). */
  placement?: 'bottom-end' | 'top-start';
};

/** Account button + menu with the logout action (AUTH-4). */
export function UserMenu({ placement = 'bottom-end' }: UserMenuProps) {
  const origin = useEndOrigin();
  // In the sidebar the menu opens from the START side (left in LTR, right in RTL).
  const sidebarOrigin = useStartOrigin();
  const { t } = useTranslation();
  const user = useSessionStore((state) => state.user);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;

  if (!user) return null;

  const isOpen = anchor !== null;
  const isSidebar = placement === 'top-start';
  const close = () => setAnchor(null);

  return (
    <>
      <Button
        id={buttonId}
        color="inherit"
        aria-label={t('auth:menu.accountFor', { name: user.name })}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        onClick={(event) => setAnchor(event.currentTarget)}
        startIcon={
          <Avatar
            aria-hidden="true"
            sx={(theme) => ({
              width: '1.75rem',
              height: '1.75rem',
              fontSize: '0.75rem',
              fontWeight: theme.typography.fontWeightMedium,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            })}
          >
            {getInitials(user.name)}
          </Avatar>
        }
        endIcon={<ExpandMoreIcon aria-hidden="true" />}
        sx={{
          maxWidth: isSidebar ? undefined : '14rem',
          width: isSidebar ? '100%' : undefined,
          justifyContent: isSidebar ? 'flex-start' : undefined,
        }}
      >
        <Box
          component="span"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {user.name}
        </Box>
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={isOpen}
        onClose={close}
        slotProps={{ list: { 'aria-labelledby': buttonId } }}
        anchorOrigin={isSidebar ? sidebarOrigin.anchorOrigin : origin.anchorOrigin}
        transformOrigin={isSidebar ? sidebarOrigin.transformOrigin : origin.transformOrigin}
      >
        <Box sx={{ paddingInline: 2, paddingBlock: 1, maxWidth: '16rem' }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            signOut('logout');
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" aria-hidden="true" />
          </ListItemIcon>
          {t('auth:menu.logout')}
        </MenuItem>
      </Menu>
    </>
  );
}
