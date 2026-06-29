import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    alias: {
      'lib': resolve(__dirname, 'src/lib'),
      'components': resolve(__dirname, 'src/components'),
      'pages': resolve(__dirname, 'src/pages'),
      'prompts': resolve(__dirname, 'src/prompts'),
      'fixtures': resolve(__dirname, 'src/fixtures'),
      '@workspace/shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
