import Box from '@mui/material/Box';
import logoDark from '@/shared/assets/logo/kanbot-logo-dark.svg';
import logoLight from '@/shared/assets/logo/kanbot-logo.svg';

type LogoProps = {
  /** Rendered height in rem. The width follows the 880:360 ratio of the artwork. */
  heightRem?: number;
};

const LOGO_WIDTH = 880;
const LOGO_HEIGHT = 360;

/**
 * The provided Kanbot logo. The light artwork has a white background and the dark
 * artwork the navy of `background.paper`, so each one blends into a card in its theme.
 */
export function Logo({ heightRem = 4 }: LogoProps) {
  const imageSx = { height: `${heightRem}rem`, width: 'auto', maxWidth: '100%' } as const;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box
        component="img"
        src={logoLight}
        alt="Kanbot"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        sx={(theme) => ({
          ...imageSx,
          ...theme.applyStyles('dark', { display: 'none' }),
        })}
      />
      <Box
        component="img"
        src={logoDark}
        alt="Kanbot"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        sx={(theme) => ({
          ...imageSx,
          display: 'none',
          ...theme.applyStyles('dark', { display: 'block' }),
        })}
      />
    </Box>
  );
}
