import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ASSISTANT_DRAWER_WIDTH_REM } from '@/shared/layout/layout';
import { useUiStore } from '@/shared/stores/uiStore';

/**
 * Empty shell of the AI assistant (its content arrives in Sprint 6). Esc and the close
 * button close it; focus goes back to the "Ask AI" button because MUI restores it.
 */
export function AssistantDrawer() {
  const isOpen = useUiStore((state) => state.assistantOpen);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  const titleId = useId();

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => setAssistantOpen(false)}
      slotProps={{
        paper: {
          'aria-labelledby': titleId,
          sx: { width: `min(100vw, ${ASSISTANT_DRAWER_WIDTH_REM}rem)`, display: 'flex' },
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
          AI assistant
        </Typography>
        <Tooltip title="Close assistant">
          <IconButton aria-label="Close assistant" onClick={() => setAssistantOpen(false)}>
            <CloseIcon aria-hidden="true" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={<AutoAwesomeIcon fontSize="large" />}
          title="Assistant coming soon"
          message="Chat, todo generation and sprint planning help will appear here."
        />
      </Box>
    </Drawer>
  );
}
