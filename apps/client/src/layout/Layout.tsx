import { Link, Outlet } from 'react-router-dom';
import type React from 'react';

export function Layout(): React.JSX.Element {
  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', gap: '1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
