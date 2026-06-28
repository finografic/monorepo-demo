import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    alias: {
      components: resolve(__dirname, 'src/components'),
      pages: resolve(__dirname, 'src/pages'),
      data: resolve(__dirname, 'src/data'),
    },
  },
});
