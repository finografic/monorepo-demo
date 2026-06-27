import { RouterProvider } from 'react-router-dom';
import type React from 'react';

import { router } from './router';

export function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
