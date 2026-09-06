/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// This repo is named "bimsuperconnector.github.io", which GitHub Pages
// serves at the domain root (https://bimsuperconnector.github.io/).
// If you ever rename the repo to a normal project repo instead of a
// <username>.github.io repo, change `base` to "/<repo-name>/".
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "SuperConnector",
        short_name: "SuperConnector",
        description:
          "A private, free, professional BIM alumni network and networking platform.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#181d26",
        icons: [
          {
            src: "/icons/logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Never cache Firestore/Firebase Auth network calls in the service
        // worker. Only precache the built static app shell (JS/CSS/HTML).
        // This keeps private data out of the SW cache per project policy.
        navigateFallbackDenylist: [/^\/__/],
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    css: true,
  },
});
