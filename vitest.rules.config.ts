import { defineConfig } from 'vitest/config';

// Firestore rules tests run against the Firestore emulator, not jsdom,
// so they get their own Vitest config/project rather than sharing
// vite.config.ts's `test` block (environment: 'jsdom'). Invoke via
// `firebase emulators:exec` so the emulator is up first — see
// package.json's `test:rules` script and .github/workflows/ci.yml.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/firestore/**/*.test.ts'],
    hookTimeout: 20_000,
    testTimeout: 20_000,
  },
});
