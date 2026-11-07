import Typography from '@mui/material/Typography';
import { AI_DISCLAIMER, AI_PRIVACY_NOTICE } from '@/features/ai/config/copy';

type AiDisclaimerProps = {
  /** Lets a control point at the text with `aria-describedby`. */
  id?: string;
};

/** Shown on every AI surface: the answer may be wrong, and the text leaves the app. */
export function AiDisclaimer({ id }: AiDisclaimerProps) {
  return (
    <Typography id={id} variant="caption" color="text.secondary">
      {AI_DISCLAIMER} {AI_PRIVACY_NOTICE}
    </Typography>
  );
}
