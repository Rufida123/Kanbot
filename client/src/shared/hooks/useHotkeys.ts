import { useEffect, useRef } from 'react';
import { getPreference } from '@/shared/lib/preferences';

export type Hotkey = {
  /** One key (`c`, `/`, `?`) or a sequence (`['g', 'b']`). Compared with `event.key`. */
  keys: string | readonly string[];
  handler: (event: KeyboardEvent) => void;
  /** Ctrl (Windows/Linux) or Cmd (macOS) must be held. Only for combos like Ctrl/Cmd + K. */
  mod?: boolean;
};

/** A follow-up key must arrive within this time of the first key of a sequence. */
export const SEQUENCE_TIMEOUT_MS = 1_000;

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.getAttribute('role') === 'textbox';
}

/** True while a dialog, menu or drawer is open: single-key shortcuts must not fire behind it. */
export function isModalOpen(): boolean {
  return document.querySelector('.MuiModal-root:not([aria-hidden="true"])') !== null;
}

/**
 * Global keyboard shortcuts (enhancement 2).
 * - Single keys and sequences are ignored while typing in a field and while a dialog is open.
 * - Combos with Ctrl/Cmd (`mod`) always work (Ctrl/Cmd + K).
 * - Anything with Ctrl/Alt/Meta that is not declared with `mod` is left to the browser.
 * - Single-key shortcuts can be switched off (WCAG 2.1.4) in the shortcuts dialog.
 */
export function useHotkeys(hotkeys: readonly Hotkey[]): void {
  const ref = useRef(hotkeys);
  ref.current = hotkeys;

  useEffect(() => {
    let pending: string | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const reset = () => {
      pending = null;
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const hasMod = event.ctrlKey || event.metaKey;

      if (hasMod && !event.altKey) {
        const combo = ref.current.find((hotkey) => hotkey.mod === true && hotkey.keys === key);
        if (combo) {
          event.preventDefault();
          combo.handler(event);
        }
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (isTypingTarget(event.target) || isModalOpen()) return;
      if (getPreference('singleKeyShortcuts') === false) return;

      const candidates = ref.current.filter((hotkey) => hotkey.mod !== true);
      if (pending !== null) {
        const first = pending;
        reset();
        const match = candidates.find(
          (hotkey) => Array.isArray(hotkey.keys) && hotkey.keys[0] === first && hotkey.keys[1] === key,
        );
        if (match) {
          event.preventDefault();
          match.handler(event);
        }
        return;
      }
      const single = candidates.find((hotkey) => hotkey.keys === key);
      if (single) {
        event.preventDefault();
        single.handler(event);
        return;
      }
      const startsSequence = candidates.some((hotkey) => Array.isArray(hotkey.keys) && hotkey.keys[0] === key);
      if (startsSequence) {
        pending = key;
        timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      reset();
    };
  }, []);
}
