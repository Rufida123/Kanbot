import { createTheme } from '@mui/material/styles';
import type { Shadows, Theme } from '@mui/material/styles';
import {
  darkScheme,
  lightScheme,
  fontFamily,
  fontWeight,
  grey,
  radius,
  shadow,
  spacingStepRem,
} from './tokens';
import type { SchemeTokens } from './tokens';

const ELEVATION_LEVELS = 25;
const MENU_ELEVATION = 8;
const OVERLAY_ELEVATION = 24;

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

export const theme: Theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: { palette: toPalette(lightScheme) },
    dark: { palette: toPalette(darkScheme) },
  },
  spacing: (factor: number) => `${spacingStepRem * factor}rem`,
  shape: { borderRadius: radius.control },
  shadows,
  typography: {
    fontFamily,
    fontWeightLight: fontWeight.light,
    fontWeightRegular: fontWeight.regular,
    fontWeightMedium: fontWeight.medium,
    fontWeightBold: fontWeight.bold,
    h1: {
      fontSize: '2rem',
      lineHeight: 1.25,
      fontWeight: fontWeight.bold,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: 1.3,
      fontWeight: fontWeight.bold,
      letterSpacing: '-0.005em',
    },
    h3: { fontSize: '1.25rem', lineHeight: 1.35, fontWeight: fontWeight.medium },
    h4: { fontSize: '1.125rem', lineHeight: 1.4, fontWeight: fontWeight.medium },
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
        body: { overflowWrap: 'break-word' },
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
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.overlay,
          borderRadius: radius.card,
        }),
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
