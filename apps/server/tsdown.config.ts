import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  deps: {
    alwaysBundle: [/^@workspace\/(config|shared)(\/.*)?$/],
  },
  clean: true,
  sourcemap: true,
});
