import { useTheme } from '@mui/material/styles';

type Vertical = 'top' | 'bottom';
type Horizontal = 'left' | 'right';
type Origin = { vertical: Vertical; horizontal: Horizontal };

/**
 * MUI popover origins are physical (`left` / `right`), not logical. This returns the origin on the
 * END side of the anchor (right in LTR, left in RTL), so menus open towards the content in both.
 */
export function useEndOrigin(
  anchorVertical: Vertical = 'bottom',
  transformVertical: Vertical = 'top',
): { anchorOrigin: Origin; transformOrigin: Origin } {
  const isRtl = useTheme().direction === 'rtl';
  const horizontal: Horizontal = isRtl ? 'left' : 'right';
  return {
    anchorOrigin: { vertical: anchorVertical, horizontal },
    transformOrigin: { vertical: transformVertical, horizontal },
  };
}

/** The START side of the anchor (left in LTR, right in RTL); the menu grows upwards. */
export function useStartOrigin(): { anchorOrigin: Origin; transformOrigin: Origin } {
  const isRtl = useTheme().direction === 'rtl';
  const horizontal: Horizontal = isRtl ? 'right' : 'left';
  return {
    anchorOrigin: { vertical: 'top', horizontal },
    transformOrigin: { vertical: 'bottom', horizontal },
  };
}
