import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users', end: false },
  { to: '/admin/translations', label: 'Translations', end: false },
  { to: '/admin/settings', label: 'Settings', end: false },
];

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors',
    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ');
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AdminLayout(): React.JSX.Element {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
        <div className="border-b px-4 py-5">
          <Link to="/" className="text-sm font-bold text-primary no-underline">
            monorepo-starter
          </Link>
          <div className="mt-2">
            <Badge>Admin</Badge>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur sm:justify-end sm:px-6">
          <Link to="/" className="text-sm font-bold text-primary no-underline md:hidden">
            monorepo-starter
          </Link>
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>{initials(user?.name ?? 'User') || 'U'}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
              Sign out
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
