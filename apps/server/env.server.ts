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
    TOKEN_COOKIE_SUFFIX: v.optional(v.string(), 'session_token'),
    DATA_COOKIE_SUFFIX: v.optional(v.string(), 'session_data'),
    AUTH_INVALIDATE_JWT_ON_SERVER_BOOT: v.optional(v.string()),
  }),
  v.transform((raw) => {
    const prefix = raw.AUTH_COOKIE_PREFIX;
    return {
      ...raw,
      DB_PATH: process.env.DB_PATH ?? path.resolve(paths.data.dir, raw.DB_NAME),
      COOKIES: {
        COOKIE_PREFIX: prefix,
        TOKEN_COOKIE: `${prefix}.${raw.TOKEN_COOKIE_SUFFIX}`,
        DATA_COOKIE: `${prefix}.${raw.DATA_COOKIE_SUFFIX}`,
      },
      COOKIE_DELETE_ATTRIBUTES: 'Max-Age=0; Path=/; HttpOnly; SameSite=Lax',
    };
  }),
);

const envServerValidated = v.parse(ServerEnvSchema, {
  DB_NAME: process.env.DB_NAME,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_COOKIE_PREFIX: process.env.AUTH_COOKIE_PREFIX,
  TOKEN_COOKIE_SUFFIX: process.env.TOKEN_COOKIE_SUFFIX,
  DATA_COOKIE_SUFFIX: process.env.DATA_COOKIE_SUFFIX,
  AUTH_INVALIDATE_JWT_ON_SERVER_BOOT: process.env.AUTH_INVALIDATE_JWT_ON_SERVER_BOOT,
});

type EnvServer = typeof envShared & typeof envServerValidated;

export const env: EnvServer = {
  ...envShared,
  ...envServerValidated,
} as const satisfies EnvServer;
