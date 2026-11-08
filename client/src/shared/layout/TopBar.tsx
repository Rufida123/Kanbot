import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PROJECT_ID_PARAM } from '@/app/navigation';
import { DensityToggle } from '@/shared/components/DensityToggle';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Breadcrumbs } from '@/shared/layout/Breadcrumbs';
import { ASK_AI_BUTTON_ID, TOP_BAR_HEIGHT_REM } from '@/shared/layout/layout';
import { useUiStore } from '@/shared/stores/uiStore';

type TopBarProps = { isDesktop: boolean };

export function TopBar({ isDesktop }: TopBarProps) {
  const { t } = useTranslation();
  const projectId = useParams()[PROJECT_ID_PARAM];
  const assistantOpen = useUiStore((state) => state.assistantOpen);
  const setAssistantOpen = useUiStore((state) => state.setAssistantOpen);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        // Sticky inside the main column: a fixed bar would cover the sidebar.
        backgroundImage: 'none',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <Toolbar sx={{ minHeight: `${TOP_BAR_HEIGHT_REM}rem`, gap: 0.5 }}>
        {isDesktop ? null : (
          <Tooltip title={t('common:app.openNavigation')}>
            <IconButton
              edge="start"
              aria-label={t('common:app.openNavigation')}
              aria-expanded={isMobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <MenuIcon aria-hidden="true" />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Breadcrumbs />
        </Box>
        <Tooltip title={`${t('common:palette.open')} (${t('common:palette.openHint')})`}>
          <IconButton aria-label={t('common:palette.open')} aria-keyshortcuts="Control+K Meta+K" onClick={() => setPaletteOpen(true)}>
            <SearchIcon aria-hidden="true" />
          </IconButton>
        </Tooltip>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Tooltip title={`${t('common:shortcuts.openHelp')} (?)`}>
            <IconButton aria-label={t('common:shortcuts.openHelp')} aria-keyshortcuts="?" onClick={() => setShortcutsOpen(true)}>
              <KeyboardOutlinedIcon aria-hidden="true" />
            </IconButton>
          </Tooltip>
          <DensityToggle />
        </Box>
        <ThemeToggle />
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <LanguageSwitcher />
        </Box>
        {/* The assistant needs a project: no button on /projects. */}
        {projectId === undefined ? null : (
          <Button
            id={ASK_AI_BUTTON_ID}
            variant="outlined"
            startIcon={<AutoAwesomeIcon aria-hidden="true" />}
            aria-haspopup="dialog"
            aria-expanded={assistantOpen}
            onClick={() => setAssistantOpen(!assistantOpen)}
            sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'inline-flex' } }}
          >
            {t('common:app.askAi')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
