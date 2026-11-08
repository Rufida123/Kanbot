import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { CHAT_HISTORY_MAX } from '@/features/ai/store/aiChatStore';
import { getAssistantPage, SUGGESTED_PROMPTS } from '@/features/ai/config/suggestedPrompts';
import { TODO_PARAM } from '@/app/navigation';
import { AiDisclaimer } from '@/features/ai/components/AiDisclaimer';
import { AiErrorAlert } from '@/features/ai/components/AiErrorAlert';
import { ChatInput } from '@/features/ai/components/ChatInput';
import { ChatMessageList } from '@/features/ai/components/ChatMessageList';
import { QuickActions } from '@/features/ai/components/QuickActions';
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
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [confirm, setConfirm] = useState<'new' | 'clear' | null>(null);
  const page = getAssistantPage(pathname, searchParams.has(TODO_PARAM));
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
    if (chat.isPending) return t('ai:status.thinking');
    return summary.isPending ? t('ai:status.summarizing') : null;
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
          <Chip size="small" variant="outlined" label={t('ai:mock.label')} title={t('ai:mock.hint')} />
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          startIcon={<AddCommentOutlinedIcon aria-hidden="true" />}
          disabled={messages.length === 0 && !isBusy && chat.error === null && !summary.isError}
          onClick={() => (messages.length > 0 ? setConfirm('new') : handleNewChat())}
        >
          {t('ai:chat.newChat')}
        </Button>
        <Button
          size="small"
          color="inherit"
          startIcon={<DeleteSweepOutlinedIcon aria-hidden="true" />}
          disabled={messages.length === 0}
          onClick={() => setConfirm('clear')}
        >
          {t('ai:chat.clearHistory')}
        </Button>
      </Box>
      <Box sx={{ padding: 2, paddingBottom: 0 }}>
        <QuickActions
          projectId={projectId}
          isBusy={isBusy}
          onSummarize={(sprintId) => void handleSummarize(sprintId)}
        />
        <Box role="group" aria-label={t('ai:suggested.group')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, marginTop: 1 }}>
          {SUGGESTED_PROMPTS[page].map((key) => (
            <Chip key={key} size="small" variant="outlined" label={t(key)} disabled={isBusy} onClick={() => chat.sendMessage(t(key))} sx={{ height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', paddingBlock: 0.5 } }} />
          ))}
        </Box>
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
        <Typography variant="caption" color="text.secondary">{t('ai:chat.historyNote', { count: CHAT_HISTORY_MAX })}</Typography>
      </Box>
      <ConfirmDialog
        open={confirm === 'new'}
        title={t('ai:chat.newChatTitle')}
        confirmLabel={t('ai:chat.newChat')}
        isDestructive
        onConfirm={() => { setConfirm(null); handleNewChat(); }}
        onCancel={() => setConfirm(null)}
      >
        {t('ai:chat.newChatBody')}
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'clear'}
        title={t('ai:chat.clearHistoryTitle')}
        confirmLabel={t('ai:chat.clearHistory')}
        isDestructive
        onConfirm={() => { setConfirm(null); chat.reset(); useAiChatStore.getState().clearAllHistory(); }}
        onCancel={() => setConfirm(null)}
      >
        {t('ai:chat.clearHistoryBody')}
      </ConfirmDialog>
    </Box>
  );
}
