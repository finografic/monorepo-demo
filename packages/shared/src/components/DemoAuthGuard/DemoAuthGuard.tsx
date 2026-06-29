import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface DemoAuthGuardProps {
  children: ReactNode;
}

interface AuthSession {
  user?: {
    email?: string | null;
  } | null;
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function apiBaseUrl(): string {
  const configuredApiBaseUrl = (
    import.meta.env.VITE_AUTH_API_BASE_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    ''
  ).replace(/\/$/, '');
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  return '';
}

function loginUrl(): string {
  const redirectTo = encodeURIComponent(window.location.href);

  if (isLocalHost()) {
    return `http://localhost:3000/login?redirectTo=${redirectTo}`;
  }

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const repoBaseUrl = baseUrl.replace(/demo-(ai-pipeline|datavis|xscan)\/?$/, '');

  return `${repoBaseUrl}login?redirectTo=${redirectTo}`;
}

async function hasSession(): Promise<boolean> {
  try {
    const res = await fetch(`${apiBaseUrl()}/api/auth/session`, { credentials: 'include' });
    if (!res.ok) return false;

    const session = (await res.json()) as AuthSession | null;
    return Boolean(session?.user?.email);
  } catch {
    return false;
  }
}

export function DemoAuthGuard({ children }: DemoAuthGuardProps) {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    void hasSession().then((allowed) => {
      if (!active) return;

      if (!allowed) {
        window.location.replace(loginUrl());
        return;
      }

      setIsAllowed(true);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!isAllowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm font-medium text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
