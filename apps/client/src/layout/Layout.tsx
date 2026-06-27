import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'text-sm font-medium no-underline transition-colors hover:text-foreground',
    isActive ? 'text-primary' : 'text-muted-foreground',
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

export function Layout(): React.JSX.Element {
  const { t } = useTranslation();
  const { user, isAuthenticated, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-sm font-bold text-foreground no-underline">
            monorepo-starter
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink to="/" end className={navLinkClass}>
              {t('ui.nav.home', 'Home')}
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/dashboard" className={navLinkClass}>
                {t('ui.nav.dashboard', 'Dashboard')}
              </NavLink>
            ) : null}
            {role === 'admin' ? (
              <NavLink to="/admin" className={navLinkClass}>
                {t('ui.nav.adminPanel', 'Admin')}
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Badge variant={role === 'admin' ? 'destructive' : 'default'}>{role}</Badge>
              <Avatar size="sm">
                <AvatarFallback>{initials(user?.name ?? 'User') || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                {t('ui.buttons.signOut', 'Sign out')}
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">{t('ui.buttons.signIn', 'Sign in')}</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
