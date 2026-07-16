import { env } from 'env.server';

import * as sqliteSchema from './schemas';
import * as postgresSchema from './schemas-postgres';

type SqliteDb = typeof import('./db.adapter').db;

const sqliteRuntime = env.DB_DIALECT === 'sqlite' ? await import('./db.adapter') : undefined;
const postgresRuntime = env.DB_DIALECT === 'postgres' ? await import('./db.postgres.adapter') : undefined;

export const db = (postgresRuntime?.postgresDb ?? sqliteRuntime?.db) as SqliteDb;
export const sqliteAny = sqliteRuntime?.sqliteAny;

export const user = (
  env.DB_DIALECT === 'postgres' ? postgresSchema.user : sqliteSchema.user
) as typeof sqliteSchema.user;
export const translations_ui = (
  env.DB_DIALECT === 'postgres' ? postgresSchema.translations_ui : sqliteSchema.translations_ui
) as typeof sqliteSchema.translations_ui;
export const translations_app = (
  env.DB_DIALECT === 'postgres' ? postgresSchema.translations_app : sqliteSchema.translations_app
) as typeof sqliteSchema.translations_app;
export const translations_admin = (
  env.DB_DIALECT === 'postgres' ? postgresSchema.translations_admin : sqliteSchema.translations_admin
) as typeof sqliteSchema.translations_admin;
