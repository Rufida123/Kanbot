import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import { useAiDialogStore } from '@/features/ai/store/aiDialogStore';
import { useProject } from '@/features/projects';
import { ASK_AI_BUTTON_ID } from '@/shared/layout/layout';
import { useUiStore } from '@/shared/stores/uiStore';

type QuickActionsProps = {
  projectId: string;
  /** An answer or a summary is on its way: summarizing is disabled until it arrives. */
  isBusy: boolean;
  onSummarize: (sprintId: string) => void;
};

/**
 * Create todos, Plan sprint, Summarize sprint. The two dialogs open through `aiDialogStore`: the
 * drawer closes first, and closing the dialog returns focus to the "Ask AI" button (the drawer's
 * own buttons are hidden by then). The active sprint comes from the project counters, so there is
 * no sprint list request.
 */
export function QuickActions({ projectId, isBusy, onSummarize }: QuickActionsProps) {
  const { t } = useTranslation();
  const openStandup = useAiDialogStore((state) => state.openStandup);
  const openEstimate = useAiDialogStore((state) => state.openEstimate);
  const hintId = useId();
  const { data: project } = useProject(projectId);
  const openGenerateTodos = useAiDialogStore((state) => state.openGenerateTodos);
  const openPlanSprint = useAiDialogStore((state) => state.openPlanSprint);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  const activeSprint = project?.stats.activeSprint ?? null;

  const openDialog = (open: (trigger: HTMLElement | null) => void) => {
    setAssistantOpen(false);
    open(document.getElementById(ASK_AI_BUTTON_ID));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box role="group" aria-label={t('ai:quick.group')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PlaylistAddIcon aria-hidden="true" />}
          onClick={() => openDialog(openGenerateTodos)}
        >
          {t('ai:quick.createTodos')}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ViewKanbanOutlinedIcon aria-hidden="true" />}
          onClick={() => openDialog(openPlanSprint)}
        >
          {t('ai:quick.planSprint')}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<SummarizeOutlinedIcon aria-hidden="true" />}
          disabled={activeSprint === null || isBusy}
          aria-describedby={activeSprint === null ? hintId : undefined}
          onClick={() => {
            if (activeSprint !== null) onSummarize(activeSprint.id);
          }}
        >
          {t('ai:quick.summarize')}
        </Button>
        <Button size="small" variant="outlined" startIcon={<StraightenOutlinedIcon aria-hidden="true" />} onClick={() => openDialog(openEstimate)}>
          {t('ai:quick.estimate')}
        </Button>
        <Button size="small" variant="outlined" startIcon={<EventNoteOutlinedIcon aria-hidden="true" />} onClick={() => openDialog(openStandup)}>
          {t('ai:quick.standup')}
        </Button>
      </Box>
      {activeSprint === null ? (
        <Typography id={hintId} variant="caption" color="text.secondary">
          <AutoAwesomeIcon aria-hidden="true" sx={{ fontSize: '0.875em', verticalAlign: '-0.125em', marginInlineEnd: 0.5 }} />
          {t('ai:summary.noActiveSprint')}
        </Typography>
      ) : null}
    </Box>
  );
}
