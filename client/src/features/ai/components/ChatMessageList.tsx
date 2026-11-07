import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { paths } from '@/app/navigation';
import { AiMarkdown } from '@/features/ai/components/AiMarkdown';
import type { AiChatMessage } from '@/features/ai/store/aiChatStore';
import { VisuallyHidden } from '@/shared/components/VisuallyHidden';

/** Closer than this to the bottom (in px) counts as "following the conversation". */
const SCROLL_PIN_THRESHOLD_PX = 80;

type MessageBubbleProps = {
  message: AiChatMessage;
  projectId: string;
  onNavigate: () => void;
};

function MessageBubble({ message, projectId, onNavigate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: '92%',
          minWidth: 0,
          paddingBlock: 1,
          paddingInline: 1.5,
          borderRadius: 2,
          backgroundColor: isUser ? 'primary.main' : 'action.hover',
          color: isUser ? 'primary.contrastText' : 'text.primary',
        }}
      >
        <VisuallyHidden>{isUser ? 'You: ' : 'Assistant: '}</VisuallyHidden>
        {isUser ? (
          // `dir="auto"`: an Arabic message keeps its direction.
          <Box dir="auto" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {message.content}
          </Box>
        ) : (
          <AiMarkdown content={message.content} />
        )}
        {message.sprintId === undefined ? null : (
          <Link
            component={RouterLink}
            to={paths.project(projectId).board}
            onClick={onNavigate}
            sx={{ display: 'inline-block', marginTop: 1 }}
          >
            View on board
          </Link>
        )}
      </Box>
    </Box>
  );
}

type ChatMessageListProps = {
  projectId: string;
  messages: readonly AiChatMessage[];
  /** "Thinking…" while an answer is on its way; null otherwise. */
  pendingLabel: string | null;
  /** Closes the drawer when a link in a message is followed. */
  onNavigate: () => void;
  /** Rendered after the messages inside the scrolling area (error alerts). */
  children?: ReactNode;
};

/**
 * The conversation. It is a polite live region, so new answers are announced. It scrolls to the
 * bottom for a new message, but not when the user has scrolled up to read (a message the user
 * just sent always scrolls into view).
 */
export function ChatMessageList({
  projectId,
  messages,
  pendingLabel,
  onNavigate,
  children,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPinnedRef = useRef(true);
  const lastMessage = messages[messages.length - 1];
  const hasChildren = children !== null && children !== undefined && children !== false;

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element === null) return;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    isPinnedRef.current = distanceFromBottom <= SCROLL_PIN_THRESHOLD_PX;
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (element === null) return;
    if (isPinnedRef.current || lastMessage?.role === 'user') {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages.length, lastMessage?.role, pendingLabel, hasChildren]);

  return (
    <Box
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation"
      onScroll={handleScroll}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        padding: 2,
      }}
    >
      {messages.length === 0 && pendingLabel === null ? (
        <Typography variant="body2" color="text.secondary">
          Ask a question about this project, or use a quick action above.
        </Typography>
      ) : null}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} projectId={projectId} onNavigate={onNavigate} />
      ))}
      {pendingLabel === null ? null : (
        <Box
          role="status"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.875rem' }}
        >
          <CircularProgress size={16} color="inherit" aria-hidden="true" />
          {pendingLabel}
        </Box>
      )}
      {children}
    </Box>
  );
}
