import Box from '@mui/material/Box';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiMarkdown } from '@/features/ai/components/AiMarkdown';
import { REDUCED_MOTION_QUERY } from '@/shared/dnd/config';
import { VisuallyHidden } from '@/shared/components/VisuallyHidden';

const WORDS_PER_TICK = 2;
const TICK_MS = 35;

/** Splits into words, keeping the whitespace, so joining the first N parts always gives clean prefix text. */
export function splitWords(text: string): string[] {
  return text.match(/\s+|\S+/g) ?? [];
}

type TypewriterMarkdownProps = { content: string; onDone: () => void };

/**
 * Simulated streaming for NEW assistant answers (enhancement 20). It reveals by words and renders
 * Markdown on the revealed text, so formatting never breaks. A click skips it. Reduced motion shows
 * the full text at once. Screen readers get the whole answer once (visually hidden), not word by word.
 */
export function TypewriterMarkdown({ content, onDone }: TypewriterMarkdownProps) {
  const { t } = useTranslation();
  const parts = useMemo(() => splitWords(content), [content]);
  const [count, setCount] = useState(0);
  const isReduced = typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const isFinished = isReduced || count >= parts.length;

  useEffect(() => {
    if (isFinished) {
      onDone();
      return;
    }
    const timer = setInterval(() => setCount((current) => Math.min(current + WORDS_PER_TICK, parts.length)), TICK_MS);
    return () => clearInterval(timer);
  }, [isFinished, parts.length, onDone]);

  if (isFinished) return <AiMarkdown content={content} />;
  return (
    <Box onClick={() => setCount(parts.length)} title={t('ai:chat.skipTyping')} sx={{ cursor: 'pointer' }}>
      <VisuallyHidden>{content}</VisuallyHidden>
      <Box aria-hidden="true">
        <AiMarkdown content={parts.slice(0, count).join('')} />
      </Box>
    </Box>
  );
}
