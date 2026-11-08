import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useColorScheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { useId, useState } from 'react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeMode } from '@/shared/lib/preferences';

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];
const ICONS: Record<ThemeMode, ComponentType<{ fontSize?: 'small'; 'aria-hidden'?: boolean }>> = {
  light: LightModeOutlinedIcon,
  dark: DarkModeOutlinedIcon,
  system: SettingsBrightnessIcon,
};

/** Light / Dark / System (enhancement 1). The choice is saved through `preferences.ts`. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const current: ThemeMode = mode ?? 'dark';
  const CurrentIcon = ICONS[current];
  const label = `${t('common:theme.label')}: ${t(`common:theme.${current}`)}`;

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          id={`${id}-button`}
          aria-label={label}
          aria-haspopup="menu"
          aria-controls={anchor ? `${id}-menu` : undefined}
          aria-expanded={anchor !== null}
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <CurrentIcon aria-hidden />
        </IconButton>
      </Tooltip>
      <Menu
        id={`${id}-menu`}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { 'aria-labelledby': `${id}-button` } }}
      >
        {THEME_MODES.map((option) => {
          const Icon = ICONS[option];
          return (
            <MenuItem
              key={option}
              selected={option === current}
              onClick={() => {
                setMode(option);
                setAnchor(null);
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" aria-hidden />
              </ListItemIcon>
              {t(`common:theme.${option}`)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
