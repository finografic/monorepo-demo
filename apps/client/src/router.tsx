import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layout/AdminLayout';
import { Layout } from './layout/Layout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminTranslationsPage } from './pages/admin/AdminTranslationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: 'print', element: <LandingPage /> },
        { path: 'login', element: <LoginPage /> },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: 'admin',
      element: (
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <AdminDashboardPage /> },
        { path: 'users', element: <AdminUsersPage /> },
        { path: 'translations', element: <AdminTranslationsPage /> },
        { path: 'settings', element: <AdminSettingsPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
