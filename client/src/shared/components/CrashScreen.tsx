import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/shared/components/ErrorState';

type CrashScreenProps = { scope: 'route' | 'global'; error: Error };

/** Message, "Reload", "Go to projects", and (development only) collapsible technical details. */
export function CrashScreen({ scope, error }: CrashScreenProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ErrorState
      isFullPage={scope === 'global'}
      title={scope === 'global' ? t('common:crash.globalTitle') : t('common:crash.title')}
      message={t('common:crash.message')}
      onRetry={() => window.location.reload()}
      retryLabel={t('common:actions.reload')}
      actions={
        <>
          {/* A plain link: the router may be the thing that crashed. */}
          <Button component="a" href="/projects" variant="outlined">
            {t('common:app.goToProjects')}
          </Button>
          {import.meta.env.DEV ? (
            <Button color="inherit" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
              {t('common:crash.details')}
            </Button>
          ) : null}
        </>
      }
      details={
        import.meta.env.DEV ? (
          <Collapse in={isOpen} unmountOnExit>
            <Box component="pre" dir="ltr" sx={{ textAlign: 'left', maxWidth: '100%', overflow: 'auto', fontSize: '0.75rem', padding: 1.5, borderRadius: 1, backgroundColor: 'action.hover' }}>
              {`${error.name}: ${error.message}`}
            </Box>
          </Collapse>
        ) : null
      }
    />
  );
}
