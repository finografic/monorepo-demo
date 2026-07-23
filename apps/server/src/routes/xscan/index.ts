import { createRouter } from 'lib/create-app';

import * as routes from './xscan.routes';

export const xscanRouter = createRouter().all(routes.xscan.path, routes.xscan.handler);
