import { defineConfig } from 'vitest/config';

// Konfig vitest terpisah agar tipe `vite@6` (dipakai @vitejs/plugin-react
// dan @tailwindcss/vite) tidak bentrok dengan vite bawaan vitest.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
