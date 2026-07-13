import { describeRoute } from 'hono-openapi';

import type { AppContext } from 'types/app.types';

export const awsDemo = {
  path: '/' as const,
  middleware: describeRoute({
    tags: ['aws-demo'],
    summary: 'AWS Lambda demo',
    description: 'Minimal Lambda-safe endpoint for the API Gateway interview slice.',
    responses: {
      200: { description: 'Demo payload' },
    },
  }),
  handler: (c: AppContext) => {
    return c.json({
      demo: 'aws-lambda',
      status: 'ok',
      region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'local',
      runtime: process.version,
      timestamp: new Date().toISOString(),
      message: 'Hono on API Gateway HTTP API → Lambda → CloudWatch',
    });
  },
};
