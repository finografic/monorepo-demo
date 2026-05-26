import { createRouter } from '../../lib/create-app';

const router = createRouter();

router.get('/demo', (c) => {
  return c.json({
    message: 'Hello from @workspace/server',
    routes: ['/api/health', '/api/demo'],
  });
});

export default router;
