/**
 * Vitest Configuration
 * Sets up the automated testing environment using jsdom for DOM emulation
 * and defines the test file inclusion patterns.
 */

import { defineConfig } from 'vitest/config';

// Konfig vitest terpisah agar tipe `vite@6` (dipakai @vitejs/plugin-react
// dan @tailwindcss/vite) tidak bentrok dengan vite bawaan vitest.
export default defineConfig({
  test: {
    // Emulate browser DOM environment for testing components and hooks
    environment: 'jsdom',
    // Glob pattern identifying test suites to execute
    include: ['src/**/*.test.ts'],
  },
});
