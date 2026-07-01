import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '../..'), '');
  const apiPort = rootEnv['API_PORT'] ?? '4000';

  return {
    base: process.env['VITE_BASE_PATH'] ?? '/',
    define: {
      'import.meta.env.VITE_AUTH_API_BASE_URL': JSON.stringify(
        process.env['VITE_AUTH_API_BASE_URL'] ?? `http://localhost:${apiPort}`,
      ),
    },

    plugins: [react(), tailwindcss()],

    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        'pages': resolve('src/pages'),
        '@workspace/shared': resolve('../../packages/shared/src'),
        '@workspace/ui/globals.css': resolve('../../packages/ui/src/styles/globals.css'),
        '@workspace/ui': resolve('../../packages/ui/src'),
        'hooks': resolve('../../packages/ui/src/hooks'),
        'ui': resolve('../../packages/ui/src/components'),
        'utils': resolve('../../packages/ui/src/lib/utils'),
      },
    },

    server: {
      port: 3003,
    },

    preview: {
      port: 3003,
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
