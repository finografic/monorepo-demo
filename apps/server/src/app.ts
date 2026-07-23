import { initAuthConfig } from '@hono/auth-js';
import { env } from 'env.server';
import { cors } from 'hono/cors';

import { getAuthConfig } from './lib/auth';
import { configureOpenAPI } from './lib/configure-openapi';
import { createApp } from './lib/create-app';

import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';
import { i18nRouter } from './routes/i18n';
import { indexRouter } from './routes/index.route';
import { streamRouter } from './routes/stream';
import { translationsRouter } from './routes/translations';
import { usersRouter } from './routes/users';
import { xscanRouter } from './routes/xscan';

const app = createApp();

app.use(
  '/*',
  cors({
    origin: (origin) => (env.CORS_ORIGINS.includes(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.use('*', initAuthConfig(getAuthConfig));

export const appWithRoutes = app
  .route('/', indexRouter)
  .route('/api/health', healthRouter)
  .route('/api/auth', authRouter)
  .route('/api/i18n', i18nRouter)
  .route('/api/stream', streamRouter)
  .route('/api/users', usersRouter)
  .route('/api/translations', translationsRouter)
  .route('/api/xscan', xscanRouter);

configureOpenAPI(appWithRoutes);

export type AppType = typeof appWithRoutes;

export default appWithRoutes;
