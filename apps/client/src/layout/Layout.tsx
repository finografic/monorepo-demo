import { Button } from '@workspace/ui/components/button';
import { User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'text-sm font-medium no-underline transition-colors hover:text-foreground',
    isActive ? 'text-primary' : 'text-muted-foreground',
  ].join(' ');
}

export function Layout(): React.JSX.Element {
  const { t } = useTranslation();
  const { isAuthenticated, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-foreground no-underline">
            monorepo-demo
          </Link>
          <nav className="flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>
              {t('ui.nav.home', 'Home')}
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/dashboard" className={navLinkClass}>
                Server Health
              </NavLink>
            ) : null}
            {role === 'admin' ? (
              <NavLink to="/admin" className={navLinkClass}>
                {t('ui.nav.adminPanel', 'Admin')}
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* <LanguageSwitcher /> */}
          {isAuthenticated ? (
            <>
              {/* <Badge variant={role === 'admin' ? 'destructive' : 'default'}>{role}</Badge> */}
              <User className="size-5 text-muted-foreground" aria-label="Signed in user" />
              <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                {t('ui.buttons.signOut', 'Sign out')}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="px-4">
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
