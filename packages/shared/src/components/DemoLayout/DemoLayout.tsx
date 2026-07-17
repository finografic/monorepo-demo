import { Button } from '@workspace/ui/components/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@workspace/ui/components/navigation-menu';
import { Separator } from '@workspace/ui/components/separator';
import { Menu, User } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';

interface DemoHeader {
  title: string;
  subtitle?: string;
}

interface DemoLayoutProps {
  header: DemoHeader;
  footer?: ReactNode;
  sidebar?: ReactNode;
  /** Full-width bar between the sidebar/main row and the footer. */
  actionBar?: ReactNode;
  sidebarLabel?: string;
  mobileSidebarOpen?: boolean;
  defaultMobileSidebarOpen?: boolean;
  onMobileSidebarOpenChange?: (open: boolean) => void;
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
  actionBar,
  sidebarLabel = 'Navigation',
  mobileSidebarOpen,
  defaultMobileSidebarOpen = true,
  onMobileSidebarOpenChange,
  children,
}: DemoLayoutProps) {
  const homeUrl = appUrl('', 'http://localhost:3000');
  const sidebarId = useId();
  const [uncontrolledMobileSidebarOpen, setUncontrolledMobileSidebarOpen] =
    useState(defaultMobileSidebarOpen);
  const hasSidebar = sidebar != null;
  const isMobileSidebarOpen = mobileSidebarOpen ?? uncontrolledMobileSidebarOpen;

  function setMobileSidebarOpen(open: boolean): void {
    setUncontrolledMobileSidebarOpen(open);
    onMobileSidebarOpenChange?.(open);
  }

  async function handleSignOut(): Promise<void> {
    await signOut();
    window.location.assign(homeUrl);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex-none bg-primary px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-primary-foreground">{header.title}</h1>
            {header.subtitle ? (
              <p className="mt-0.5 text-sm text-primary-foreground/75">{header.subtitle}</p>
            ) : null}
          </div>

          <div className="flex w-full min-w-0 items-center justify-end gap-2 md:w-1/2">
            {hasSidebar ? (
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-foreground transition-all outline-none hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 md:hidden"
                aria-controls={sidebarId}
                aria-expanded={isMobileSidebarOpen}
                onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                <Menu className="size-4" aria-hidden="true" />
                {isMobileSidebarOpen ? 'Hide' : 'Menu'}
              </Button>
            ) : null}

            <NavigationMenu
              viewport={false}
              className="min-w-0 max-w-full flex-1 justify-end overflow-x-auto md:flex-none"
            >
              <NavigationMenuList className="justify-end gap-1 sm:gap-2 md:gap-4">
                {NAV_ITEMS.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      className="px-2 py-2 text-xs text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground sm:text-sm md:px-3"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem aria-hidden="true" className="hidden sm:block">
                  <Separator orientation="vertical" className="h-6 bg-primary-foreground/35" />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-primary-foreground transition-all outline-none hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 sm:text-sm md:px-3"
                    aria-label="Sign out"
                    onClick={() => {
                      void handleSignOut();
                    }}
                  >
                    <User className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {hasSidebar ? (
          <aside
            id={sidebarId}
            className={[
              'min-h-0 flex-col overflow-hidden border-border bg-background',
              isMobileSidebarOpen ? 'flex flex-1 border-b' : 'hidden',
              'md:flex md:max-h-none md:w-[30rem] md:flex-none md:border-r md:border-b-0 lg:w-[32rem]',
            ].join(' ')}
            aria-label={sidebarLabel}
          >
            {sidebar}
          </aside>
        ) : null}

        <main
          className={[
            'min-h-0 flex-1 flex-col overflow-hidden',
            hasSidebar && isMobileSidebarOpen ? 'hidden md:flex' : 'flex',
          ].join(' ')}
        >
          {children}
        </main>
      </div>

      {actionBar}

      {footer != null && (
        <footer className="flex flex-none flex-wrap items-center justify-between gap-x-6 gap-y-1.5 bg-primary px-4 py-3 md:px-6">
          {footer}
        </footer>
      )}
    </div>
  );
}
