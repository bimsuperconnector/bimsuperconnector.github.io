import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Precaches only the built static app shell (see vite.config.ts) — never
// intercepts Firestore/Auth network calls, so no private data is cached.
registerSW({ immediate: true });
