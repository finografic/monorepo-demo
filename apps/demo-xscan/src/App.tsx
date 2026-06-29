import { DemoAuthGuard } from '@workspace/shared/components';
import { DemoPage } from 'pages/DemoPage';
import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DemoAuthGuard>
            <DemoPage />
          </DemoAuthGuard>
        }
      />
    </Routes>
  );
}
