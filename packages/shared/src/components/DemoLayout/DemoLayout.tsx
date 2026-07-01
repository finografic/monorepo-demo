import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@workspace/ui/components/navigation-menu';
import { Separator } from '@workspace/ui/components/separator';
import { User } from 'lucide-react';
import type { ReactNode } from 'react';

interface DemoHeader {
  title: string;
  subtitle?: string;
}

interface DemoLayoutProps {
  header: DemoHeader;
  footer?: ReactNode;
  sidebar?: ReactNode;
  sidebarLabel?: string;
  children: ReactNode;
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function appUrl(path: string, localUrl: string): string {
  if (isLocalHost()) {
    return localUrl;
  }

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const repoBaseUrl = baseUrl.replace(/demo-(ai-pipeline|datavis|xscan)\/?$/, '');

  return `${repoBaseUrl}${path}`;
}

function apiBaseUrl(): string {
  return (import.meta.env.VITE_AUTH_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? '').replace(
    /\/$/,
    '',
  );
}

async function getCsrfToken(): Promise<string | null> {
  const res = await fetch(`${apiBaseUrl()}/api/auth/csrf`, { credentials: 'include' });
  if (!res.ok) return null;

  const data = (await res.json()) as { csrfToken?: string };
  return data.csrfToken ?? null;
}

async function signOut(): Promise<void> {
  const csrfToken = await getCsrfToken();
  if (!csrfToken) return;

  await fetch(`${apiBaseUrl()}/api/auth/signout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken }),
    credentials: 'include',
    redirect: 'manual',
  });
}

const NAV_ITEMS = [
  { label: 'Home', href: appUrl('', 'http://localhost:3000') },
  { label: 'Demo 1', href: appUrl('demo-ai-pipeline/', 'http://localhost:3001') },
  { label: 'Demo 2', href: appUrl('demo-datavis/', 'http://localhost:3002') },
  { label: 'Demo 3', href: appUrl('demo-xscan/', 'http://localhost:3003') },
] as const;

export function DemoLayout({
  header,
  footer,
  sidebar,
  sidebarLabel = 'Navigation',
  children,
}: DemoLayoutProps) {
  const homeUrl = appUrl('', 'http://localhost:3000');

  async function handleSignOut(): Promise<void> {
    await signOut();
    window.location.assign(homeUrl);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex-none bg-primary px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-primary-foreground">{header.title}</h1>
            {header.subtitle ? (
              <p className="mt-0.5 text-sm text-primary-foreground/75">{header.subtitle}</p>
            ) : null}
          </div>

          <div className="flex w-1/2 items-center justify-end">
            <NavigationMenu viewport={false} className="max-w-none flex-none justify-end">
              <NavigationMenuList className="justify-end gap-4">
                {NAV_ITEMS.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      className="px-3 py-2 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem aria-hidden="true">
                  <Separator orientation="vertical" className="h-6 bg-primary-foreground/35" />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground transition-all outline-none hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1"
                    onClick={() => {
                      void handleSignOut();
                    }}
                  >
                    <User className="size-4" aria-hidden="true" />
                    Sign out
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebar != null && (
          <aside
            className="flex-none w-[30rem] lg:w-[32rem] border-r border-border flex flex-col overflow-hidden"
            aria-label={sidebarLabel}
          >
            {sidebar}
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>

      {footer != null && (
        <footer className="flex flex-none items-center justify-between gap-6 bg-primary px-6 py-3">
          {footer}
        </footer>
      )}
    </div>
  );
}
