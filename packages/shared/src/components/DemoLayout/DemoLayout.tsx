import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@workspace/ui/components/navigation-menu';
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

const NAV_ITEMS = [
  { label: 'Start', href: appUrl('', 'http://localhost:3000') },
  { label: 'Demo 1', href: appUrl('demo-ai-pipeline/', 'http://localhost:3001') },
  { label: 'Demo 2', href: appUrl('demo-datavis/', 'http://localhost:3002') },
  { label: 'Demo 3', href: appUrl('demo-xscan/', 'http://localhost:3003') },
] as const;

const SIGN_IN_URL = appUrl('login', 'http://localhost:3000/login');

export function DemoLayout({
  header,
  footer,
  sidebar,
  sidebarLabel = 'Navigation',
  children,
}: DemoLayoutProps) {
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

          <div className="flex w-2/3 items-center justify-end gap-4">
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
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center border-l border-primary-foreground/25 pl-4">
              <a
                href={SIGN_IN_URL}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground underline-offset-4 hover:bg-primary-foreground/15 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
              >
                Sign in
              </a>
            </div>
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

      {footer != null && <footer className="flex-none bg-primary px-6 py-3">{footer}</footer>}
    </div>
  );
}
