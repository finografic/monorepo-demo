import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import type { AppBindings } from '../types/app.types';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { pinoLogger } from '../middlewares/pino-logger';

export function createRouter(): Hono<AppBindings> {
  return new Hono<AppBindings>({ strict: false });
}

export function createApp(): Hono<AppBindings> {
  const app = createRouter();

  app.use(pinoLogger());

  app.notFound((c) => {
    return c.json(
      { error: 'NOT_FOUND', message: `${c.req.method} ${c.req.path} not found` },
      StatusCodes.NOT_FOUND as ContentfulStatusCode,
    );
  });

  app.onError((err, c) => {
    const status: ContentfulStatusCode =
      'status' in err && typeof err.status === 'number'
        ? (err.status as ContentfulStatusCode)
        : StatusCodes.INTERNAL_SERVER_ERROR;
    c.var.logger?.error({ err }, err.message);
    return c.json({ error: 'INTERNAL_ERROR', message: err.message }, status);
  });

  return app;
}
