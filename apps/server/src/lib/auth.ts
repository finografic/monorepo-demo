import Credentials from '@auth/core/providers/credentials';
import { db } from 'db';
import { eq } from 'drizzle-orm';
import { env } from 'env.server';
import type { AuthConfig } from '@hono/auth-js';

import { runtimeAuthSecret } from 'lib/auth-secret.runtime';
import { verifyPassword } from 'utils/password.utils';

import { user } from '../db/schemas';

export function getAuthConfig(): AuthConfig {
  return {
    basePath: '/api/auth',
    secret: runtimeAuthSecret,
    providers: [
      Credentials({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        authorize: async (credentials) => {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          const [foundUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

          if (!foundUser?.hashedPassword) return null;

          const valid = await verifyPassword(password, foundUser.hashedPassword);
          if (!valid) return null;

          return {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            image: foundUser.image,
            role: foundUser.role,
          };
        },
      }),
    ],
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
      signIn: '/login',
    },
    callbacks: {
      jwt({ token, user: authUser }) {
        if (authUser) {
          token.id = authUser.id;
          token.role = (authUser as { role?: string }).role;
        }
        return token;
      },
      session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
          (session.user as unknown as Record<string, unknown>).role = token.role;
        }
        return session;
      },
    },
    cookies: {
      sessionToken: {
        name: env.COOKIES.TOKEN_COOKIE,
        options: {
          httpOnly: true,
          sameSite: env.COOKIES.SAME_SITE,
          path: '/',
          secure: env.COOKIES.SECURE,
        },
      },
      csrfToken: {
        name: `${env.COOKIES.COOKIE_PREFIX}.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: env.COOKIES.SAME_SITE,
          path: '/',
          secure: env.COOKIES.SECURE,
        },
      },
      callbackUrl: {
        name: `${env.COOKIES.COOKIE_PREFIX}.callback-url`,
        options: {
          httpOnly: true,
          sameSite: env.COOKIES.SAME_SITE,
          path: '/',
          secure: env.COOKIES.SECURE,
        },
      },
    },
    trustHost: true,
  };
}

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: 'public' | 'user' | 'admin';
  };
  expires: string;
}
