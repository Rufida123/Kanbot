import { createTheme } from '@mui/material/styles';
import type { Shadows, Theme } from '@mui/material/styles';
import {
  darkScheme,
  lightScheme,
  fontFamily,
  fontWeight,
  grey,
  radius,
  elevation,
  shadow,
  motion,
  spacingStepRem,
} from './tokens';
import type { SchemeTokens } from './tokens';

const ELEVATION_LEVELS = 25;
const MENU_ELEVATION = elevation.menu;
const OVERLAY_ELEVATION = elevation.overlay;

/** Flat UI: only menus and dialogs cast a shadow. */
const shadows = Array.from({ length: ELEVATION_LEVELS }, (_, level) => {
  if (level === MENU_ELEVATION) return shadow.menu;
  if (level === OVERLAY_ELEVATION) return shadow.overlay;
  return shadow.none;
}) as Shadows;

function toPalette(tokens: SchemeTokens) {
  return {
    primary: tokens.primary,
    secondary: tokens.secondary,
    error: tokens.error,
    warning: tokens.warning,
    info: tokens.info,
    success: tokens.success,
    grey,
    background: tokens.background,
    text: tokens.text,
    divider: tokens.divider,
    focusRing: tokens.focusRing,
    status: tokens.status,
    priority: tokens.priority,
  };
}

export type Direction = 'ltr' | 'rtl';

/** One theme per text direction (MUI needs `direction` on the theme, emotion needs the RTL cache). */
export function createAppTheme(direction: Direction): Theme {
  return createTheme({
  direction,
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: { palette: toPalette(lightScheme) },
    dark: { palette: toPalette(darkScheme) },
  },
  spacing: (factor: number) => `${spacingStepRem * factor}rem`,
  shape: { borderRadius: radius.control },
  transitions: {
    easing: { easeInOut: motion.easing, easeOut: motion.easing },
    duration: {
      shortest: motion.durationMs.fast,
      shorter: motion.durationMs.fast,
      short: motion.durationMs.base,
      standard: motion.durationMs.base,
      enteringScreen: motion.durationMs.base,
      leavingScreen: motion.durationMs.fast,
    },
  },
  shadows,
  typography: {
    fontFamily,
    fontWeightRegular: fontWeight.regular,
    fontWeightMedium: fontWeight.medium,
    fontWeightBold: fontWeight.bold,
    h1: {
      fontSize: '2rem',
      lineHeight: 1.25,
      fontWeight: fontWeight.semibold,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: 1.3,
      fontWeight: fontWeight.semibold,
      letterSpacing: '-0.015em',
    },
    h3: { fontSize: '1.25rem', lineHeight: 1.35, fontWeight: fontWeight.semibold, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.125rem', lineHeight: 1.4, fontWeight: fontWeight.semibold, letterSpacing: '-0.005em' },
    h5: { fontSize: '1rem', lineHeight: 1.5, fontWeight: fontWeight.medium },
    h6: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: fontWeight.medium },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: fontWeight.medium },
    subtitle2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: fontWeight.medium },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: fontWeight.medium,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        '*, *::before, *::after': { margin: 0, padding: 0, boxSizing: 'border-box' },
        'html, body, #root': { minHeight: '100%' },
        html: { scrollbarWidth: 'thin', scrollbarColor: `${theme.vars.palette.grey[500]} transparent` },
        body: {
          overflowWrap: 'break-word',
          fontFeatureSettings: '"cv11", "ss03"',
          textRendering: 'optimizeLegibility',
        },
        // Calm UI for people who ask for less motion: transitions and animations are cut short.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
        // Minimum 44px touch targets for icon buttons and nav items on touch screens (WCAG 2.5.5).
        '@media (pointer: coarse)': {
          '.MuiIconButton-root': { minWidth: '2.75rem', minHeight: '2.75rem' },
          '.MuiMenuItem-root, .MuiListItemButton-root': { minHeight: '2.75rem' },
        },
        ':focus-visible': {
          outline: `2px solid ${theme.vars.palette.focusRing}`,
          outlineOffset: '2px',
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          backgroundImage: 'none',
          // Outlined papers are the app's cards.
          ...(ownerState.variant === 'outlined' &&
            !ownerState.square && { borderRadius: radius.card }),
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({ backgroundColor: theme.vars.palette.background.overlay }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: radius.control,
          // Indigo 500 is too dark for text on navy: use the light indigo in dark mode.
          ...(ownerState.color === 'primary' &&
            ownerState.variant !== 'contained' &&
            theme.applyStyles('dark', { color: theme.vars.palette.primary.light })),
        }),
        sizeLarge: { minHeight: '2.75rem', fontSize: '0.9375rem' },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 500, enterNextDelay: 200 },
    },
    MuiDialog: {
      defaultProps: { transitionDuration: { enter: motion.durationMs.base, exit: motion.durationMs.fast } },
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.overlay,
          borderRadius: radius.card,
        }),
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create(['background-color', 'color']),
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create('background-color'),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: fontWeight.medium },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: fontWeight.medium,
          ...theme.applyStyles('dark', { color: theme.vars.palette.primary.light }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radius.control,
          backgroundColor: theme.vars.palette.background.paper,
        }),
        input: { padding: '0.6875rem 0.875rem' },
        notchedOutline: ({ theme }) => ({ borderColor: theme.vars.palette.grey[500] }),
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          fontWeight: fontWeight.medium,
          color: theme.vars.palette.text.primary,
        }),
        asterisk: ({ theme }) => ({ color: theme.vars.palette.text.secondary }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginInline: 0 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radius.control, alignItems: 'center' },
      },
    },
  },
});
}

export const theme: Theme = createAppTheme('ltr');
