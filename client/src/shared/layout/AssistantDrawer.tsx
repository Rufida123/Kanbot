import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useId } from 'react';
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { AssistantPanel } from '@/features/ai';
import { ASSISTANT_DRAWER_WIDTH_REM } from '@/shared/layout/layout';
import { useUiStore } from '@/shared/stores/uiStore';

/**
 * The AI assistant (AI-1). The frame lives here (paper, title, close button); the content is
 * `AssistantPanel`. It needs a project, so on `/projects` it renders nothing and closes itself.
 * The drawer stays mounted while closed (`keepMounted`): the typed text, the scroll position and
 * a request in flight survive closing and reopening it. Esc and the close button close it, and
 * MUI returns focus to the "Ask AI" button.
 */
export function AssistantDrawer() {
  const { t } = useTranslation();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const isOpen = useUiStore((state) => state.assistantOpen);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  const titleId = useId();

  useEffect(() => {
    if (projectId === undefined && isOpen) setAssistantOpen(false);
  }, [projectId, isOpen, setAssistantOpen]);

  return (
    <Drawer
      anchor="right"
      open={isOpen && projectId !== undefined}
      onClose={() => setAssistantOpen(false)}
      slotProps={{
        root: { keepMounted: true },
        paper: {
          'aria-labelledby': titleId,
          sx: { width: `min(100vw, ${ASSISTANT_DRAWER_WIDTH_REM}rem)`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          paddingInline: 2,
          minHeight: '3.5rem',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography id={titleId} component="h2" variant="h4">
          {t('common:app.aiAssistant')}
        </Typography>
        <Tooltip title={t('common:app.closeAssistant')}>
          <IconButton aria-label={t('common:app.closeAssistant')} onClick={() => setAssistantOpen(false)}>
            <CloseIcon aria-hidden="true" />
          </IconButton>
        </Tooltip>
      </Box>
      {projectId === undefined ? null : <AssistantPanel projectId={projectId} />}
    </Drawer>
  );
}
