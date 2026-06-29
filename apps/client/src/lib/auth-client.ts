import { apiBaseUrl } from './api-base-url';

const AUTH_BASE = `${apiBaseUrl()}/api/auth`;

let csrfCache: { token: string; expiresAt: number } | null = null;
const CSRF_TTL_MS = 30_000;

async function getCsrfToken(): Promise<string> {
  const now = Date.now();
  if (csrfCache && now < csrfCache.expiresAt) return csrfCache.token;

  const res = await fetch(`${AUTH_BASE}/csrf`, { credentials: 'include' });
  const data = (await res.json()) as { csrfToken: string };
  csrfCache = { token: data.csrfToken, expiresAt: now + CSRF_TTL_MS };
  return data.csrfToken;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: 'public' | 'user' | 'admin';
  };
  expires: string;
}

interface SignUpResult {
  user?: { id: string; name: string; email: string; role: string };
  error?: string;
}

export const authClient = {
  getSession: async (): Promise<AuthSession | null> => {
    try {
      const res = await fetch(`${AUTH_BASE}/session`, { credentials: 'include' });
      if (!res.ok) return null;
      const data = (await res.json()) as AuthSession | null;
      if (!data?.user?.email) return null;
      return data;
    } catch {
      return null;
    }
  },

  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      try {
        const csrfToken = await getCsrfToken();

        const res = await fetch(`${AUTH_BASE}/callback/credentials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email, password, csrfToken }),
          credentials: 'include',
          redirect: 'manual',
        });

        // Auth.js issues a 302 redirect on success and failure. With redirect: 'manual'
        // we receive an opaque response. The JWT cookie is set via Set-Cookie on the redirect.
        // We check the session to determine success vs wrong credentials.
        if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 0) {
          const session = await authClient.getSession();
          if (session?.user) return { data: { user: session.user }, error: null };
          return { data: null, error: { message: 'Invalid credentials' } };
        }

        if (res.ok) {
          const session = await authClient.getSession();
          if (session?.user) return { data: { user: session.user }, error: null };
        }

        return { data: null, error: { message: 'Invalid credentials' } };
      } catch (err) {
        return {
          data: null,
          error: { message: err instanceof Error ? err.message : 'Sign in failed' },
        };
      }
    },
  },

  signUp: {
    email: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      try {
        const res = await fetch(`${AUTH_BASE}/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
          credentials: 'include',
        });
        const data = (await res.json()) as SignUpResult;
        if (!res.ok || data.error) {
          return { data: null, error: { message: data.error ?? 'Sign up failed' } };
        }
        return { data: { user: data.user }, error: null };
      } catch (err) {
        return {
          data: null,
          error: { message: err instanceof Error ? err.message : 'Sign up failed' },
        };
      }
    },
  },

  signOut: async () => {
    try {
      const csrfToken = await getCsrfToken();
      csrfCache = null;

      await fetch(`${AUTH_BASE}/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ csrfToken }),
        credentials: 'include',
        redirect: 'manual',
      });

      return { data: { success: true }, error: null };
    } catch (err) {
      return {
        data: { success: false },
        error: { message: err instanceof Error ? err.message : 'Sign out failed' },
      };
    }
  },
};
