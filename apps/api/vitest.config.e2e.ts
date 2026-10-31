import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.e2e-spec.ts'],
  },
  resolve: {
    alias: {
      '@billpilot/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  plugins: [swc.vite()],
});

