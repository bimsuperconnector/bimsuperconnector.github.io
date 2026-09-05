/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env (and .env.local etc.) so VITE_BASE_PATH is available here too —
  // Vite only auto-exposes env vars to client code via import.meta.env, not
  // to this config file, so we load it explicitly for the `base` option.
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_BASE_PATH || '/';

  return {
    // GitHub Pages serves the site from https://<user>.github.io/<repo>/
    // unless a custom domain is configured, so the app needs to know its own
    // base path. Set VITE_BASE_PATH in the deployment workflow / .env to the
    // repo name (e.g. "/superconnector/"); it defaults to "/" for local dev
    // and for a custom-domain deployment that serves from the root.
    base: basePath,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Precache only the built app shell (HTML/JS/CSS/icons). Deliberately
        // no runtimeCaching rules are configured here: Firebase Auth and
        // Firestore requests must never be cached by the service worker, since
        // that could serve stale or unauthorized private data offline. If a
        // future phase adds runtime caching (e.g. for public landing-page
        // assets), it must explicitly exclude Firestore/Auth/Google API
        // origins.
        manifest: {
          name: 'SuperConnector',
          short_name: 'SuperConnector',
          description:
            'A private, free professional network for verified BIM alumni.',
          theme_color: '#1a1a1a',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: basePath,
          scope: basePath,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // No navigateFallback beyond the default app-shell handling, and no
          // runtime caching entries — see note above.
          runtimeCaching: [],
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
    },
  };
});
