import { Button } from '@workspace/ui/components/button';
import { User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { DEFAULT_LANGUAGE } from '../i18n/i18n.constants';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return [
    'text-sm font-medium no-underline transition-colors hover:text-foreground',
    isActive ? 'text-primary' : 'text-muted-foreground',
  ].join(' ');
}

export function Layout(): React.JSX.Element {
  const landingMatch = useMatch({ path: '/', end: true });

  // NOTE: Autodetection (`localStorage` → `navigator`) still applies on login, dashboard, and admin.
  //       A stale `localStorage.i18nextLng=es-ES` survives browser sessions and overrides navigator —
  //       e.g. after living in Spain, even when based in Australia. Fresh AU visitors with `en-AU`
  //       navigator language would get en-GB without this override.
  // TEMP: Pin navbar chrome to en-GB on the landing route only — portfolio copy is partly inline English
  //       and partly partial DB translations; the language switcher is intentionally hidden.
  // TODO: Remove this route override once docs/todo/TODO_I18N.md Phase E ships full landing translations.
  const { t: tDetected } = useTranslation();
  const { t: tLanding } = useTranslation(undefined, { lng: DEFAULT_LANGUAGE });
  const t = landingMatch ? tLanding : tDetected;
  const { isAuthenticated, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-nowrap sm:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link to="/" className="shrink-0 text-sm font-bold text-foreground no-underline">
            monorepo-demo
          </Link>
          <nav className="flex min-w-0 items-center gap-4 md:gap-8">
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

        <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
          {/* <LanguageSwitcher /> */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* <Badge variant={role === 'admin' ? 'destructive' : 'default'}>{role}</Badge> */}
              <User className="size-4 text-muted-foreground" aria-label="Signed in user" />
              <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                {t('ui.buttons.signOut', 'Sign out')}
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="px-4">
              <Link to="/login" className="whitespace-nowrap">
                {t('ui.buttons.signIn', 'Sign in')}
              </Link>
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
