/**
 * Design tokens: the only place where raw colour values live.
 * Components read them through the MUI theme (`theme.vars.palette.*`), never directly.
 *
 * Palette comes from the Kanbot logo: indigo #4F46E5 (primary), green #22C55E (secondary),
 * navy #111827 (dark surface). Neutrals are the matching cool-grey ramp.
 * Every text/surface pair was checked for WCAG AA contrast (see client/README.md).
 */

/**
 * Inter covers Latin; IBM Plex Sans Arabic covers Arabic (both self-hosted by @fontsource, loaded
 * with `font-display: swap`). A glyph missing from Inter falls through to the Arabic font, so one
 * stack works for English, Arabic and mixed text. Fallbacks cover the time before they load.
 */
export const fontFamily =
  '"Inter", "IBM Plex Sans Arabic", "Noto Sans Arabic", "Roboto", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';

/** Type scale in rem. Components pick a theme variant, never a raw size. */
export const typeScale = { xs: 0.75, sm: 0.8125, base: 0.875, md: 1, lg: 1.125, xl: 1.25, xxl: 1.5, display: 2 } as const;

/** Only these four weights are loaded (main.tsx). */
export const fontWeight = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** Spacing step in rem: theme.spacing(2) = 1rem (8px grid). The only spacing scale. */
export const spacingStepRem = 0.5;

/** Corner radius in px. */
export const radius = { chip: 4, control: 8, card: 16, pill: 999 } as const;

export const grey = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

/** Motion tokens: short, calm transitions. `prefers-reduced-motion` switches them off (theme.ts). */
export const motion = {
  durationMs: { fast: 120, base: 200, slow: 320 },
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

/** Elevation scale: flat by default; only floating layers cast a shadow. */
export const elevation = { flat: 0, menu: 8, overlay: 24 } as const;

export const shadow = {
  none: 'none',
  /** Menus and popovers. */
  menu: '0 0.25rem 1rem rgba(17, 24, 39, 0.16)',
  /** Dialogs and drawers. */
  overlay: '0 1rem 3rem rgba(17, 24, 39, 0.28)',
} as const;

type StatusTokens = { todo: string; in_progress: string; in_review: string; done: string };
type PriorityTokens = { low: string; medium: string; high: string; urgent: string };
type SemanticTokens = { main: string; contrastText: string };

export type SchemeTokens = {
  primary: { main: string; light: string; dark: string; contrastText: string };
  secondary: { main: string; light: string; dark: string; contrastText: string };
  error: SemanticTokens;
  warning: SemanticTokens;
  info: SemanticTokens;
  success: SemanticTokens;
  background: { default: string; paper: string; overlay: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
  focusRing: string;
  status: StatusTokens;
  priority: PriorityTokens;
};

export const lightScheme: SchemeTokens = {
  primary: { main: '#4F46E5', light: '#818CF8', dark: '#4338CA', contrastText: '#FFFFFF' },
  secondary: { main: '#22C55E', light: '#4ADE80', dark: '#15803D', contrastText: grey[900] },
  error: { main: '#B91C1C', contrastText: '#FFFFFF' },
  warning: { main: '#B45309', contrastText: '#FFFFFF' },
  info: { main: '#2563EB', contrastText: '#FFFFFF' },
  success: { main: '#15803D', contrastText: '#FFFFFF' },
  background: { default: grey[100], paper: '#FFFFFF', overlay: '#FFFFFF' },
  text: { primary: grey[900], secondary: grey[600], disabled: grey[400] },
  divider: grey[300],
  focusRing: '#4F46E5',
  status: { todo: grey[600], in_progress: '#4F46E5', in_review: '#B45309', done: '#15803D' },
  priority: { low: grey[600], medium: '#2563EB', high: '#C2410C', urgent: '#B91C1C' },
};

export const darkScheme: SchemeTokens = {
  // Slightly lighter indigo than the logo so white button text and the focus
  // ring both stay above AA on the navy surfaces.
  primary: { main: '#6063EE', light: '#A5B4FC', dark: '#4F46E5', contrastText: '#FFFFFF' },
  secondary: { main: '#22C55E', light: '#4ADE80', dark: '#15803D', contrastText: grey[900] },
  error: { main: '#F87171', contrastText: grey[900] },
  warning: { main: '#FBBF24', contrastText: grey[900] },
  info: { main: '#60A5FA', contrastText: grey[900] },
  success: { main: '#4ADE80', contrastText: grey[900] },
  // Three surface levels: page, card (same navy as the logo), overlay (menus, dialogs).
  background: { default: '#0B1220', paper: grey[900], overlay: grey[800] },
  text: { primary: grey[50], secondary: grey[400], disabled: grey[500] },
  divider: grey[700],
  focusRing: '#A5B4FC',
  status: { todo: grey[400], in_progress: '#A5B4FC', in_review: '#FBBF24', done: '#4ADE80' },
  priority: { low: grey[400], medium: '#60A5FA', high: '#FB923C', urgent: '#F87171' },
};
