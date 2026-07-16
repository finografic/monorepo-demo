import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

declare const process: {
  env: {
    DATABASE_URL?: string;
  };
};

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://monorepo_demo:monorepo_demo@localhost:5433/monorepo_demo';

export default defineConfig({
  schema: './src/db/schemas/*.schema.ts',
  out: '../../data/migrations-postgres',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
