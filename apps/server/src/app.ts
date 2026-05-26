import { cors } from 'hono/cors';

import { createApp } from './lib/create-app';

import demo from './routes/demo/demo.route';
import health from './routes/health/health.route';

const app = createApp();

app.use(
  '/*',
  cors({
    origin: (origin) => origin,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

const routes = [health, demo] as const;

routes.forEach((route) => {
  app.route('/api', route);
});

export default app;
