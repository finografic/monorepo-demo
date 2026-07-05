import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { DEFAULT_LANGUAGE } from '../i18n/i18n.constants';

const GITHUB_URL = 'https://github.com/finografic/monorepo-demo';

function GitHubMark(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" className="size-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27s-1.36.09-2 .27c-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

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
          {landingMatch ? (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              <GitHubMark />
              <span className="hidden sm:inline">View on GitHub</span>
            </a>
          ) : null}
          {landingMatch ? (
            <Separator orientation="vertical" className="hidden h-6 sm:block" aria-hidden="true" />
          ) : null}
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
