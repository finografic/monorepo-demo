import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '../..'), '');
  const apiPort = rootEnv['API_PORT'] ?? '4000';
  const basePath = process.env['VITE_BASE_PATH'] ?? rootEnv['VITE_BASE_PATH'] ?? '/';

  return {
    base: basePath,

    plugins: [react(), tailwindcss()],

    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'lib': resolve('src/lib'),
        'components': resolve('src/components'),
        'pages': resolve('src/pages'),
        'prompts': resolve('src/prompts'),
        'fixtures': resolve('src/fixtures'),
        '@workspace/ui/globals.css': resolve('../../packages/ui/src/styles/globals.css'),
        '@workspace/ui': resolve('../../packages/ui/src'),
        '@workspace/shared': resolve('../../packages/shared/src'),
        'hooks': resolve('../../packages/ui/src/hooks'),
        'ui': resolve('../../packages/ui/src/components'),
        'utils': resolve('../../packages/ui/src/lib/utils'),
      },
    },

    server: {
      port: 3001,
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
