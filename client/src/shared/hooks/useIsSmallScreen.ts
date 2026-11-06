import useMediaQuery from '@mui/material/useMediaQuery';
import { SMALL_SCREEN_MEDIA_QUERY } from '@/shared/layout/layout';

/** True below the `sm` breakpoint: dialogs go full screen there. */
export function useIsSmallScreen(): boolean {
  return useMediaQuery(SMALL_SCREEN_MEDIA_QUERY, { noSsr: true });
}
