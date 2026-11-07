import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useIsMutating } from '@tanstack/react-query';
import { useId } from 'react';
import { aiMutationKeys } from '@/features/ai/api/keys';
import { SprintSummaryContent } from '@/features/ai/components/SprintSummaryContent';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import type { Sprint } from '@/shared/types/api';

type SprintSummaryDialogProps = {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
};

/**
 * The summary of the active sprint, opened from the board header (an inline panel would break the
 * board's column height). It cannot be dismissed while a summary is being generated.
 */
export function SprintSummaryDialog({ projectId, sprint, onClose }: SprintSummaryDialogProps) {
  const titleId = useId();
  const isSmallScreen = useIsSmallScreen();
  const isPending = useIsMutating({ mutationKey: aiMutationKeys.sprintSummary }) > 0;

  return (
    <Dialog
      open
      onClose={isPending ? undefined : onClose}
      aria-labelledby={titleId}
      aria-busy={isPending}
      scroll="paper"
      fullWidth
      maxWidth="sm"
      fullScreen={isSmallScreen}
    >
      <DialogTitle id={titleId} sx={{ overflowWrap: 'anywhere' }}>
        AI summary · {sprint.name}
      </DialogTitle>
      <DialogContent>
        <SprintSummaryContent projectId={projectId} sprint={sprint} />
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={isPending}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
