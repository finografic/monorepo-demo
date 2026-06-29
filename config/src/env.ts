import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import * as v from 'valibot';

import { findRootDir } from './paths';

const rootDir = findRootDir();
const nodeEnv = process.env.NODE_ENV || 'development';
const envPaths = [path.resolve(rootDir, `.env.${nodeEnv}`), path.resolve(rootDir, '.env')];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const EnvSchema = v.pipe(
  v.object({
    NODE_ENV: v.optional(v.picklist(['development', 'production', 'test']), 'development'),
    API_PORT: v.optional(v.number(), 4000),
    API_BASE_PATH: v.optional(v.string(), '/api'),
    CLIENT_PORT: v.optional(v.number(), 3000),
  }),
  v.transform((parsed) => ({
    ...parsed,
    API_URL: `http://localhost:${parsed.API_PORT}${parsed.API_BASE_PATH}`,
    CLIENT_URL: `http://localhost:${parsed.CLIENT_PORT}`,
  })),
);

const apiPort = process.env.PORT ?? process.env.API_PORT;

const validated = v.parse(EnvSchema, {
  NODE_ENV: process.env.NODE_ENV,
  API_PORT: apiPort ? Number(apiPort) : undefined,
  API_BASE_PATH: process.env.API_BASE_PATH,
  CLIENT_PORT: process.env.CLIENT_PORT ? Number(process.env.CLIENT_PORT) : undefined,
});

export type Env = typeof validated;

export const env: Env = { ...validated } as const satisfies Env;
