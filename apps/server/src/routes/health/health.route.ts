import { createRouter } from '../../lib/create-app';

const router = createRouter();

router.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
