import { useEffect, useRef, useState } from 'react';
import { REDUCED_MOTION_QUERY } from '@/shared/dnd/config';
import { formatNumber } from '@/shared/utils/formatDate';

const DURATION_MS = 400;

/** A number that counts up or down to its new value (section 3.3). No animation for reduced motion. */
export function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      fromRef.current = value;
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const next = Math.round(from + (value - from) * (1 - (1 - progress) ** 3));
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = value;
    };
  }, [value]);

  return <span>{formatNumber(shown)}</span>;
}
