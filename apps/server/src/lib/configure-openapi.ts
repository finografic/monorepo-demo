import { apiReference } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import type { AppOpenAPI } from '../types/app.types';

export function configureOpenAPI(app: AppOpenAPI): void {
  app.get(
    '/api/doc',
    openAPIRouteHandler(app, {
      documentation: {
        openapi: '3.1.0',
        info: {
          title: 'monorepo-demo API',
          version: '0.0.1',
          description: 'Hono + Drizzle + Auth.js starter API',
        },
        tags: [
          { name: 'health', description: 'Liveness and readiness' },
          { name: 'auth', description: 'Authentication (sign-up, sign-in, sign-out)' },
          { name: 'i18n', description: 'Translations and supported languages' },
          { name: 'users', description: 'User management (admin)' },
          { name: 'translations', description: 'Translation CMS (admin)' },
        ],
      },
    }),
  );

  app.get(
    '/api/reference',
    apiReference({
      theme: 'kepler',
      layout: 'classic',
      spec: { url: '/api/doc' },
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
    }),
  );
}
