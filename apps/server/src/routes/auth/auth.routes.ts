import { authHandler } from '@hono/auth-js';
import { db } from 'db';
import { user } from 'db/schemas';
import { eq } from 'drizzle-orm';
import { env } from 'env.server';
import { describeRoute } from 'hono-openapi';
import { rateLimit } from 'middlewares/rate-limit';
import * as v from 'valibot';

import { hashPassword } from 'utils/password.utils';

import type { AppContext, ValidatedJsonContext } from 'types/app.types';

const { COOKIES, COOKIE_DELETE_ATTRIBUTES } = env;

export const signUpRateLimit = rateLimit({ limit: 5, windowMs: 60_000 });
export const signInRateLimit = rateLimit({ limit: 10, windowMs: 60_000 });

export const signUpBodySchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(4), v.maxLength(64)),
  name: v.pipe(v.string(), v.minLength(1)),
});

type SignUpBody = v.InferOutput<typeof signUpBodySchema>;

export const signUp = {
  path: '/sign-up' as const,
  schema: signUpBodySchema,
  middleware: describeRoute({
    tags: ['auth'],
    summary: 'Register a new account',
    description: 'Creates a new user with role=user. Rate-limited to 5 requests per minute per IP.',
    responses: {
      201: { description: 'Account created' },
      400: { description: 'Validation error' },
      409: { description: 'Email already registered' },
      429: { description: 'Rate limit exceeded' },
    },
  }),
  handler: async (c: ValidatedJsonContext<SignUpBody, '/sign-up'>) => {
    try {
      const { email, password, name } = c.req.valid('json');

      const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

      if (existing) {
        return c.json({ error: 'CONFLICT', message: 'Email already registered' }, 409);
      }

      const hashedPassword = await hashPassword(password);
      const now = new Date();

      const [created] = await db
        .insert(user)
        .values({
          name,
          email,
          hashedPassword,
          emailVerified: false,
          role: 'user',
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return c.json(
        {
          user: {
            id: created!.id,
            name: created!.name,
            email: created!.email,
            role: created!.role,
          },
        },
        201,
      );
    } catch (error) {
      c.var.logger?.error({ err: error }, 'Sign-up error');
      return c.json({ error: 'INTERNAL_ERROR', message: 'Registration failed' }, 500);
    }
  },
};

export const clearAllCookies = {
  path: '/clear-all-cookies' as const,
  middleware: describeRoute({
    tags: ['auth'],
    summary: 'Clear all auth cookies',
    description: 'Debug helper — clears all known auth cookie variants.',
    responses: { 200: { description: 'Cookies cleared' } },
  }),
  handler: (c: AppContext) => {
    const response = c.json({ success: true, message: 'All cookies cleared' });

    const cookieNames = [
      COOKIES.TOKEN_COOKIE,
      COOKIES.DATA_COOKIE,
      `${COOKIES.COOKIE_PREFIX}.csrf-token`,
      `${COOKIES.COOKIE_PREFIX}.callback-url`,
      `__Secure-${COOKIES.TOKEN_COOKIE}`,
      `__Secure-${COOKIES.DATA_COOKIE}`,
      `__Secure-${COOKIES.COOKIE_PREFIX}.csrf-token`,
      `__Secure-${COOKIES.COOKIE_PREFIX}.callback-url`,
      `__Host-${COOKIES.TOKEN_COOKIE}`,
      `__Host-${COOKIES.DATA_COOKIE}`,
      `__Host-${COOKIES.COOKIE_PREFIX}.csrf-token`,
      `__Host-${COOKIES.COOKIE_PREFIX}.callback-url`,
      'authjs.csrf-token',
      'authjs.callback-url',
      '__Host-authjs.csrf-token',
      '__Secure-authjs.callback-url',
      `${COOKIES.COOKIE_PREFIX}.auth_token`,
      `${COOKIES.COOKIE_PREFIX}.session`,
    ];

    const deletionAttributes = [
      COOKIE_DELETE_ATTRIBUTES,
      'Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure',
    ];

    cookieNames.forEach((cookieName) => {
      deletionAttributes.forEach((attrs) => {
        response.headers.append('Set-Cookie', `${cookieName}=; ${attrs}`);
      });
    });

    return response;
  },
};

export const authJs = {
  path: '/*' as const,
  handler: authHandler(),
};
