import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schemas/*.schema.ts',
  out: '../../data/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: '../../data/monorepo-demo.sqlite.db',
  },
  verbose: true,
  strict: true,
}) satisfies Config;
