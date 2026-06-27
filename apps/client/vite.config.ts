import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '../..'), '');
  const apiPort = rootEnv['API_PORT'] ?? '4000';

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'context': resolve('src/context'),
        'lib': resolve('src/lib'),
        'providers': resolve('src/providers'),
        'queries': resolve('src/queries'),
        '@workspace/ui/globals.css': resolve('../../packages/ui/src/styles/globals.css'),
        '@workspace/ui': resolve('../../packages/ui/src'),
        '@workspace/ui/components': resolve('../../packages/ui/src/components'),
        '@workspace/ui/hooks': resolve('../../packages/ui/src/hooks'),
        '@workspace/ui/lib': resolve('../../packages/ui/src/lib'),
        'hooks': resolve('../../packages/ui/src/hooks'),
        'ui': resolve('../../packages/ui/src/components'),
        'utils': resolve('../../packages/ui/src/lib/utils'),
      },
    },

    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
