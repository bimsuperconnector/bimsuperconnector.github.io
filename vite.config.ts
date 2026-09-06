import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  // Served from the root of https://bimsuperconnector.github.io/
  base: '/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // generateSW with no runtimeCaching entries precaches only the built
      // static app shell (JS/CSS/HTML/icons). It never intercepts
      // Firestore/Auth network calls, so private data is never cached by
      // the service worker — see SECURITY_AND_TESTING.md's PWA section.
      registerType: 'autoUpdate',
      injectRegister: false, // we call registerSW() ourselves in main.tsx
      includeAssets: ['assets/branding/*.png', 'assets/branding/*.ico'],
      manifest: {
        name: 'SuperConnector',
        short_name: 'SuperConnector',
        description:
          'A private alumni network, directory, and monthly connection engine.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#181d26',
        icons: [
          {
            src: '/assets/branding/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/branding/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/assets/branding/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell only; do not add extra runtime caching
        // rules for API calls (Firestore/Auth are never intercepted).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
    }),
  ],
});
