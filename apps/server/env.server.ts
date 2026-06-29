import path from 'node:path';
import { env as envShared } from '@workspace/config/env';
import { paths } from '@workspace/config/paths';
import * as v from 'valibot';

const ServerEnvSchema = v.pipe(
  v.object({
    DB_NAME: v.optional(v.string(), 'development.sqlite.db'),
    AUTH_SECRET: v.pipe(v.string(), v.minLength(16)),
    AUTH_URL: v.optional(v.string()),
    AUTH_COOKIE_PREFIX: v.optional(v.string(), 'monorepo-demo'),
    AUTH_COOKIE_SAME_SITE: v.optional(v.picklist(['lax', 'strict', 'none'])),
    AUTH_COOKIE_SECURE: v.optional(v.picklist(['true', 'false'])),
    TOKEN_COOKIE_SUFFIX: v.optional(v.string(), 'session_token'),
    DATA_COOKIE_SUFFIX: v.optional(v.string(), 'session_data'),
    AUTH_INVALIDATE_JWT_ON_SERVER_BOOT: v.optional(v.string()),
    CORS_ORIGINS: v.optional(v.string()),
  }),
  v.transform((raw) => {
    const prefix = raw.AUTH_COOKIE_PREFIX;
    const cookieSameSite =
      raw.AUTH_COOKIE_SAME_SITE ?? (envShared.NODE_ENV === 'production' ? 'none' : 'lax');
    const cookieSecure = raw.AUTH_COOKIE_SECURE
      ? raw.AUTH_COOKIE_SECURE === 'true'
      : envShared.NODE_ENV === 'production';
    const defaultCorsOrigins =
      envShared.NODE_ENV === 'production'
        ? envShared.CLIENT_URL
        : [
            envShared.CLIENT_URL,
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
          ].join(',');
    const corsOrigins = (raw.CORS_ORIGINS ?? defaultCorsOrigins)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    return {
      ...raw,
      DB_PATH: process.env.DB_PATH ?? path.resolve(paths.data.dir, raw.DB_NAME),
      CORS_ORIGINS: corsOrigins,
      COOKIES: {
        COOKIE_PREFIX: prefix,
        TOKEN_COOKIE: `${prefix}.${raw.TOKEN_COOKIE_SUFFIX}`,
        DATA_COOKIE: `${prefix}.${raw.DATA_COOKIE_SUFFIX}`,
        SAME_SITE: cookieSameSite,
        SECURE: cookieSecure,
      },
      COOKIE_DELETE_ATTRIBUTES: `Max-Age=0; Path=/; HttpOnly; SameSite=${cookieSameSite};${
        cookieSecure ? ' Secure' : ''
      }`,
    };
  }),
);

const envServerValidated = v.parse(ServerEnvSchema, {
  DB_NAME: process.env.DB_NAME,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_COOKIE_PREFIX: process.env.AUTH_COOKIE_PREFIX,
  AUTH_COOKIE_SAME_SITE: process.env.AUTH_COOKIE_SAME_SITE,
  AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE,
  TOKEN_COOKIE_SUFFIX: process.env.TOKEN_COOKIE_SUFFIX,
  DATA_COOKIE_SUFFIX: process.env.DATA_COOKIE_SUFFIX,
  AUTH_INVALIDATE_JWT_ON_SERVER_BOOT: process.env.AUTH_INVALIDATE_JWT_ON_SERVER_BOOT,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
});

type EnvServer = typeof envShared & typeof envServerValidated;

export const env: EnvServer = {
  ...envShared,
  ...envServerValidated,
} as const satisfies EnvServer;
