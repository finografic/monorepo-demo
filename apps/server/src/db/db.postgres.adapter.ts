import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from 'env.server';
import pc from 'picocolors';
import postgres from 'postgres';

import * as schema from './schemas';

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for PostgreSQL database operations.');
}

const postgresClient = postgres(env.DATABASE_URL);

console.log(`  ${pc.dim('●')} Database:      ${pc.dim('PostgreSQL')}`);

export const postgresDb = drizzle(postgresClient, { schema });
export const closePostgres = () => postgresClient.end();
