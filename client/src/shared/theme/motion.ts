import { keyframes } from '@mui/material/styles';
import { motion } from './tokens';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(0.375rem); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/** Content that appears: fades in while rising a few pixels. */
export const enterAnimationSx = {
  animation: `${fadeInUp} ${motion.durationMs.base}ms ${motion.easing} both`,
} as const;

/** A page that replaces another: a plain fade (no movement, so layout never seems to jump). */
export const pageEnterSx = {
  animation: `${fadeIn} ${motion.durationMs.slow}ms ${motion.easing} both`,
} as const;

/** `enterAnimationSx` delayed by the item's position (capped), for the first rows of a list. */
export function staggeredEnterSx(index: number) {
  const MAX_STEPS = 8;
  const STEP_MS = 24;
  return {
    ...enterAnimationSx,
    animationDelay: `${Math.min(index, MAX_STEPS) * STEP_MS}ms`,
  } as const;
}
