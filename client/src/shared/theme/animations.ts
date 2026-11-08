import { motion } from './tokens';

/**
 * Reusable animation mixins for consistent, calm transitions across the app.
 * All animations respect prefers-reduced-motion.
 */

export const animations = {
  /**
   * Fade in/out for dialogs, drawers, menus.
   */
  fadeInOut: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    '@keyframes fadeOut': {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    animation: `fadeIn ${motion.durationMs.base}ms ${motion.easing}`,
  },

  /**
   * Scale + fade for modals and popovers.
   */
  scaleIn: {
    '@keyframes scaleIn': {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    animation: `scaleIn ${motion.durationMs.base}ms ${motion.easing}`,
  },

  /**
   * Slide up + fade for bottom sheets / drawers.
   */
  slideUpIn: {
    '@keyframes slideUpIn': {
      from: { opacity: 0, transform: 'translateY(1rem)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: `slideUpIn ${motion.durationMs.base}ms ${motion.easing}`,
  },

  /**
   * List item enter animation (staggered via CSS delay on nth-child).
   */
  listItemIn: {
    '@keyframes listItemIn': {
      from: { opacity: 0, transform: 'translateY(-0.5rem)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: `listItemIn ${motion.durationMs.base}ms ${motion.easing}`,
  },

  /**
   * Smooth hover lift effect for cards.
   */
  hoverLift: {
    transition: `transform ${motion.durationMs.base}ms ${motion.easing}, box-shadow ${motion.durationMs.base}ms ${motion.easing}`,
    '&:hover': {
      transform: 'translateY(-0.25rem)',
    },
  },

  /**
   * Page transition fade.
   */
  pageTransition: {
    '@keyframes pageEnter': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: `pageEnter ${motion.durationMs.base}ms ${motion.easing}`,
  },

  /**
   * Smooth color transitions for theme changes.
   */
  colorTransition: {
    transition: `background-color ${motion.durationMs.base}ms ${motion.easing}, color ${motion.durationMs.base}ms ${motion.easing}`,
  },
} as const;

/**
 * Helper to apply animations with prefers-reduced-motion support.
 * Returns animation styles or empty object if user prefers reduced motion.
 */
export function getAnimationStyles(animationStyles: Record<string, unknown>) {
  if (typeof window === 'undefined') {
    return animationStyles;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return {};
  }

  return animationStyles;
}
