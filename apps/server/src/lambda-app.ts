import { cors } from 'hono/cors';

import { createApp } from './lib/create-app';

import { awsDemoRouter } from './routes/aws-demo';
import * as healthRoutes from './routes/health/health.routes';

/**
 * Minimal Hono app for AWS Lambda.
 * Intentionally does not import `app.ts` (Auth.js, SQLite, SSE).
 */
const app = createApp();

app.use(
  '/*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (
        origin === 'http://localhost:3000' ||
        origin === 'http://localhost:3001' ||
        origin === 'http://localhost:3002' ||
        origin === 'http://localhost:3003' ||
        origin === 'https://finografic.github.io'
      ) {
        return origin;
      }
      return null;
    },
    allowMethods: ['GET', 'OPTIONS'],
    credentials: false,
  }),
);

app.get('/health', healthRoutes.health.middleware, healthRoutes.health.handler);
app.route('/api/aws-demo', awsDemoRouter);

export default app;
