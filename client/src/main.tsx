import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// One file per weight (AI_RULES §4): only what the theme uses, `font-display: swap` included.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import App from '@/app/App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
