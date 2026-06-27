import { Spinner } from '@workspace/ui/components/spinner';
import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type Role = 'user' | 'admin';

const ROLE_ORDER = ['public', 'user', 'admin'] as const;

interface Props {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole = 'user' }: Props): React.JSX.Element {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (ROLE_ORDER.indexOf(role) < ROLE_ORDER.indexOf(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
