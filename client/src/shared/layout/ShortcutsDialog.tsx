import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreference } from '@/shared/hooks/usePreference';
import { useIsSmallScreen } from '@/shared/hooks/useIsSmallScreen';
import { useUiStore } from '@/shared/stores/uiStore';

export const SHORTCUTS: readonly { keys: readonly string[]; labelKey: string }[] = [
  { keys: ['c'], labelKey: 'shortcuts.createTodo' },
  { keys: ['/'], labelKey: 'shortcuts.focusSearch' },
  { keys: ['?'], labelKey: 'shortcuts.help' },
  { keys: ['g', 'b'], labelKey: 'shortcuts.goBoard' },
  { keys: ['g', 'l'], labelKey: 'shortcuts.goBacklog' },
  { keys: ['g', 's'], labelKey: 'shortcuts.goSprints' },
  { keys: ['Ctrl/⌘', 'K'], labelKey: 'shortcuts.palette' },
  { keys: ['Esc'], labelKey: 'shortcuts.closeEsc' },
];

function Key({ children }: { children: string }) {
  return (
    <Box component="kbd" dir="ltr" sx={{ fontFamily: 'inherit', fontSize: '0.75rem', paddingInline: 0.75, paddingBlock: 0.25, borderRadius: 0.5, border: 1, borderColor: 'divider', backgroundColor: 'action.hover', minWidth: '1.5rem', textAlign: 'center' }}>
      {children}
    </Box>
  );
}

/** The `?` help dialog (enhancement 2). Also hosts the switch that turns single-key shortcuts off. */
export function ShortcutsDialog() {
  const { t } = useTranslation();
  const open = useUiStore((state) => state.isShortcutsOpen);
  const setOpen = useUiStore((state) => state.setShortcutsOpen);
  const [enabled, setEnabled] = usePreference('singleKeyShortcuts');
  const titleId = useId();
  const fullScreen = useIsSmallScreen();
  return (
    <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby={titleId} fullWidth maxWidth="xs" fullScreen={fullScreen}>
      <DialogTitle id={titleId}>{t('common:shortcuts.title')}</DialogTitle>
      <DialogContent>
        <Box component="ul" sx={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {SHORTCUTS.map((shortcut) => (
            <Box component="li" key={shortcut.labelKey} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{t(`common:${shortcut.labelKey}`)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} dir="ltr">
                {shortcut.keys.map((key, index) => (
                  <Box component="span" key={key} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    {index > 0 && shortcut.keys.length === 2 && shortcut.keys[0] === 'g' ? (
                      <Typography variant="caption" color="text.secondary">{t('common:shortcuts.then')}</Typography>
                    ) : index > 0 ? <Typography variant="caption" color="text.secondary">+</Typography> : null}
                    <Key>{key}</Key>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginBlock: 2 }}>
          {t('common:shortcuts.hint')}
        </Typography>
        <FormControlLabel
          control={<Switch checked={enabled !== false} onChange={(event) => setEnabled(event.target.checked)} />}
          label={t('common:shortcuts.enableSingleKey')}
        />
      </DialogContent>
    </Dialog>
  );
}
