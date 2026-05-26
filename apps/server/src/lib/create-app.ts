import { Hono } from 'hono';

export function createRouter(): Hono {
  return new Hono({ strict: false });
}

export function createApp(): Hono {
  const app = createRouter();

  app.notFound((c) => {
    return c.json({ message: `Not Found — ${c.req.method} ${c.req.path}` }, 404);
  });

  app.onError((err, c) => {
    return c.json({ message: err.message }, 500);
  });

  return app;
}
