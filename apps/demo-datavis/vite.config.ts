import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'components': resolve('src/components'),
      'pages': resolve('src/pages'),
      'data': resolve('src/data'),
      '@workspace/ui/globals.css': resolve('../../packages/ui/src/styles/globals.css'),
      '@workspace/ui': resolve('../../packages/ui/src'),
      'hooks': resolve('../../packages/ui/src/hooks'),
      'ui': resolve('../../packages/ui/src/components'),
      'utils': resolve('../../packages/ui/src/lib/utils'),
    },
  },

  server: {
    port: 3002,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
