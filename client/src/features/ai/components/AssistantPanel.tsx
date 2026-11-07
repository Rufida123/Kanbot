import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { useEffect, useRef } from 'react';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { ChatInput } from '@/features/ai/components/ChatInput';
import { ChatMessageList } from '@/features/ai/components/ChatMessageList';
import { QuickActions } from '@/features/ai/components/QuickActions';
import { AI_MOCK_HINT, AI_MOCK_LABEL, AI_SUMMARIZING_LABEL, AI_THINKING_LABEL } from '@/features/ai/config/copy';
import { useAiStatus } from '@/features/ai/hooks/useAiStatus';
import { useChat } from '@/features/ai/hooks/useChat';
import { useSprintSummary } from '@/features/ai/hooks/useSprintSummary';
import { useAiChatStore } from '@/features/ai/store/aiChatStore';
import { useUiStore } from '@/shared/stores/uiStore';

type AssistantPanelProps = { projectId: string };

/**
 * Body of the assistant drawer (AI-1): status badge, "New chat", quick actions, the conversation
 * and the input. The drawer stays mounted when it is closed, so the conversation, the typed text
 * and a request in flight survive closing and reopening it. It is mounted only on project pages.
 */
export function AssistantPanel({ projectId }: AssistantPanelProps) {
  const { data: status } = useAiStatus();
  const isOpen = useUiStore((state) => state.assistantOpen);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  const chatProjectId = useAiChatStore((state) => state.projectId);
  const storedMessages = useAiChatStore((state) => state.messages);
  const openProject = useAiChatStore((state) => state.openProject);
  const startNewChat = useAiChatStore((state) => state.startNewChat);
  const chat = useChat(projectId);
  const summary = useSprintSummary(projectId);
  const { reset: resetSummary } = summary;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The drawer sits above the project pages and is not remounted on a project switch, so the
  // conversation is compared with the current project. Until the effect runs, nothing old shows.
  useEffect(() => {
    openProject(projectId);
    resetSummary();
  }, [projectId, openProject, resetSummary]);
  const messages = chatProjectId === projectId ? storedMessages : [];

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const isBusy = chat.isPending || summary.isPending;
  const pendingLabel = (() => {
    if (chat.isPending) return AI_THINKING_LABEL;
    return summary.isPending ? AI_SUMMARIZING_LABEL : null;
  })();

  const handleNewChat = () => {
    chat.reset();
    resetSummary();
    startNewChat(projectId);
    inputRef.current?.focus();
  };

  const handleSummarize = async (sprintId: string) => {
    try {
      const { summary: result } = await summary.mutateAsync(sprintId);
      useAiChatStore.getState().addMessage(projectId, {
        role: 'assistant',
        content: result.content,
        sprintId,
      });
    } catch {
      // The error is shown from `summary.error`, with a retry button.
    }
  };

  const summarizedSprintId = summary.variables;
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          paddingBlock: 1,
          paddingInline: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {status?.mode === 'mock' ? (
          <Chip size="small" variant="outlined" label={AI_MOCK_LABEL} title={AI_MOCK_HINT} />
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          startIcon={<AddCommentOutlinedIcon aria-hidden="true" />}
          disabled={messages.length === 0 && !isBusy && chat.error === null && !summary.isError}
          onClick={handleNewChat}
        >
          New chat
        </Button>
      </Box>
      <Box sx={{ padding: 2, paddingBottom: 0 }}>
        <QuickActions
          projectId={projectId}
          isBusy={isBusy}
          onSummarize={(sprintId) => void handleSummarize(sprintId)}
        />
      </Box>
      <ChatMessageList
        projectId={projectId}
        messages={messages}
        pendingLabel={pendingLabel}
        onNavigate={() => setAssistantOpen(false)}
      >
        {chat.error === null ? null : <AiErrorAlert error={chat.error} onRetry={chat.retry} />}
        {summary.isError && summarizedSprintId !== undefined ? (
          <AiErrorAlert error={summary.error} onRetry={() => void handleSummarize(summarizedSprintId)} />
        ) : null}
      </ChatMessageList>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          padding: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <ChatInput isDisabled={isBusy} inputRef={inputRef} onSend={chat.sendMessage} />
        <AiDisclaimer />
      </Box>
    </Box>
  );
}
