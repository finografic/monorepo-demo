import { createRouter } from 'lib/create-app';

import * as routes from './aws-demo.routes';

export const awsDemoRouter = createRouter().get(
  routes.awsDemo.path,
  routes.awsDemo.middleware,
  routes.awsDemo.handler,
);
