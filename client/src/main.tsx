import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Sets the saved colour scheme on <html> before React renders (no flash of the wrong theme).
import { applyInitialColorScheme } from '@/shared/theme/themeStorage';
// i18n initialises on import and sets <html lang dir>.
import '@/shared/i18n';
// One file per weight (AI_RULES §4): only what the theme uses, `font-display: swap` included.
// Inter covers Latin, IBM Plex Sans Arabic covers Arabic.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import App from '@/app/App';
import { registerServiceWorker } from '@/shared/pwa/registerServiceWorker';

applyInitialColorScheme();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
