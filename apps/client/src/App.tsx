import { Route, Routes } from 'react-router-dom';
import type React from 'react';

import { Layout } from './layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';

export function App(): React.JSX.Element {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
