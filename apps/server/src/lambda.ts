import { handle } from 'hono/aws-lambda';

import app from './lambda-app';

export const handler = handle(app);
