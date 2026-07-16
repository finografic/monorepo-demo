# SQLite to PostgreSQL Migration Notes

Purpose: reusable notes for migrating a Drizzle-backed TypeScript app from local/file SQLite to PostgreSQL, using this
repo as the concrete example.

These notes are intentionally detailed because this migration pattern will likely repeat across other projects.

---

## Current Shape in This Repo

The active app still runs on SQLite:

- Runtime adapter: `apps/server/src/db/db.adapter.ts`
- Schema files: `apps/server/src/db/schemas/*.schema.ts`
- Drizzle config: `apps/server/drizzle.config.ts`
- Migration runner: `apps/server/src/db/utils/migrate.ts`
- Seed runner: `apps/server/src/db/utils/seed.ts`
- Seed config: `config/db-setup.config.ts`
- Local DB env: `.env.example`

The first non-breaking PostgreSQL setup is now available through Docker:

```bash
pnpm db:postgres:up
pnpm db:postgres:psql
pnpm db:postgres:down
```

Local connection string:

```bash
DATABASE_URL=postgresql://monorepo_demo:monorepo_demo@localhost:5433/monorepo_demo
```

Important: the Docker database exists for migration work, but the app is not using it until the adapter, schemas, and
migrations are converted.

The Postgres Drizzle config is separate from the active SQLite config:

- active SQLite config: `apps/server/drizzle.config.ts`
- migration Postgres config: `apps/server/drizzle.postgres.config.ts`

Do not expect `db:postgres:generate` to succeed until the schema files are converted from `sqlite-core` to `pg-core`.

---

## Migration Strategy

Prefer a staged migration:

1. Add PostgreSQL locally without changing runtime behavior.
2. Convert schema definitions to PostgreSQL.
3. Add a PostgreSQL adapter and Drizzle config.
4. Generate PostgreSQL migrations into a separate output folder.
5. Update migration and seed scripts to run against PostgreSQL.
6. Validate local app flows end-to-end.
7. Create AWS RDS infrastructure.
8. Run migrations/seeds against RDS.
9. Cut deployed API from SQLite to `DATABASE_URL`.

Do not mix schema conversion and AWS RDS provisioning in one step. Local PostgreSQL should pass first.

---

## Common SQLite to PostgreSQL Differences

| Area       | SQLite pattern                                 | PostgreSQL pattern                            | Notes                                             |
| ---------- | ---------------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Adapter    | `better-sqlite3`                               | `postgres` or `pg` driver                     | Drizzle has different adapters per driver.        |
| Schema API | `sqliteTable`, `text`, `integer`               | `pgTable`, `text`, `boolean`, `timestamp`     | Import paths change across every schema file.     |
| Boolean    | `integer(..., { mode: 'boolean' })`            | `boolean(...)`                                | Remove SQLite boolean coercion helpers.           |
| Timestamp  | `integer(..., { mode: 'timestamp' })`          | `timestamp(..., { withTimezone: true })`      | Decide timezone policy once and keep consistent.  |
| JSON       | `text(..., { mode: 'json' })`                  | `jsonb(...)`                                  | PostgreSQL `jsonb` is usually better for objects. |
| IDs        | `text().$defaultFn(() => crypto.randomUUID())` | `uuid().defaultRandom()` or text UUID default | Prefer `uuid` unless app needs text IDs.          |
| Migrations | SQLite SQL                                     | PostgreSQL SQL                                | Do not reuse SQLite migration SQL.                |
| Reset      | delete DB file                                 | drop schema/database objects                  | PostgreSQL reset needs explicit SQL.              |
| FK checks  | `PRAGMA foreign_keys`                          | transaction/drop order/cascade                | SQLite pragmas do not exist in PostgreSQL.        |

---

## Step-by-Step Checklist

### 1. Confirm Local Tooling

Start PostgreSQL:

```bash
pnpm db:postgres:up
```

Check health:

```bash
docker compose ps postgres
```

Open `psql`:

```bash
pnpm db:postgres:psql
```

Useful `psql` commands:

```sql
\dt
\d auth_user
select now();
```

### 2. Add PostgreSQL Runtime Dependency

Drizzle supports multiple PostgreSQL drivers. The likely smallest choice here is `postgres`:

```bash
pnpm --filter @workspace/server add postgres
```

Then the adapter shape becomes:

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

Keep this change separate from schema conversion when possible.

### 3. Extend Env Validation

Add `DATABASE_URL` as optional while SQLite remains available:

```ts
DATABASE_URL: v.optional(v.pipe(v.string(), v.url())),
DB_DIALECT: v.optional(v.picklist(['sqlite', 'postgres']), 'sqlite'),
```

Later, once PostgreSQL is the active default, require `DATABASE_URL` when `DB_DIALECT=postgres`.

Avoid silently falling back to SQLite in production after cutover. A missing production `DATABASE_URL` should fail fast.

### 4. Convert Schema Imports

Current SQLite imports look like:

```ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
```

PostgreSQL imports should move to:

```ts
import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
```

Convert each `sqliteTable(...)` to `pgTable(...)`.

### 5. Convert Columns

Examples from this repo:

```ts
emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false)
```

becomes:

```ts
emailVerified: boolean('emailVerified').notNull().default(false)
```

```ts
createdAt: integer('createdAt', { mode: 'timestamp' })
  .notNull()
  .$defaultFn(() => new Date())
```

becomes either:

```ts
createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow()
```

or, if application-generated timestamps are preferred:

```ts
createdAt: timestamp('createdAt', { withTimezone: true })
  .notNull()
  .$defaultFn(() => new Date())
```

For JSON translation maps:

```ts
translations: text('translations', { mode: 'json' })
  .$type<Record<string, string>>()
  .notNull()
```

becomes:

```ts
translations: jsonb('translations').$type<Record<string, string>>().notNull()
```

### 6. Replace SQLite Boolean Validation

Current helper:

```ts
sqliteBooleanField()
```

For PostgreSQL, request payloads should generally parse to real booleans:

```ts
v.boolean()
```

If browser/admin forms still submit string values, create a database-agnostic helper such as `booleanField()` that
normalizes `"true"`, `"false"`, `"1"`, and `"0"` to `boolean`, not `0 | 1`.

### 7. Split or Replace Drizzle Config

Current config is SQLite-only:

```ts
dialect: 'sqlite',
dbCredentials: {
  url: '../../data/monorepo-demo.sqlite.db',
},
```

For PostgreSQL:

```ts
dialect: 'postgresql',
dbCredentials: {
  url: process.env.DATABASE_URL!,
},
```

Recommended transition:

- keep `drizzle.config.ts` for the active database, or
- add `drizzle.postgres.config.ts` while validating migrations side-by-side.

Use a separate migrations folder during conversion, for example:

```text
data/migrations-postgres/
```

This avoids mixing SQLite and PostgreSQL migration SQL.

This repo uses the side-by-side config approach during migration.

### 8. Update Migration Runner

The current migration runner imports SQLite-specific pieces:

```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
```

PostgreSQL needs the PostgreSQL driver and migrator:

```ts
import { migrate } from 'drizzle-orm/postgres-js/migrator';
```

The reset logic must also change:

- Remove `sqlite_master` queries.
- Remove `PRAGMA foreign_keys`.
- Use PostgreSQL catalog queries or a controlled `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.
- Be careful with destructive reset scripts in deployed environments.

For local-only development, a simple reset can be:

```sql
drop schema public cascade;
create schema public;
```

Never run that against production/RDS unless the command is explicitly scoped and guarded.

### 9. Update Seed Flow

Seed files can often remain mostly unchanged if they only call `db.insert(...).values(...)`.

Watch for:

- boolean values that were previously `0 | 1`
- JSON values that were previously serialized as SQLite text
- timestamp values
- conflict handling syntax
- table/column renames

Seed order still matters because auth sessions/accounts reference users.

### 10. Validate Local App Flows

Minimum local validation after PostgreSQL cutover:

```bash
pnpm db:postgres:up
pnpm --filter @workspace/server db:migrations:generate
pnpm --filter @workspace/server db:migrations:run
pnpm --filter @workspace/server db:setup
pnpm dev
```

Then test:

- login with `guest@test.com`
- `/api/auth/session`
- `/api/i18n/translations?lng=en-GB`
- AI live streaming
- datavis page
- xscan page
- admin/user routes if exposed

### 11. AWS RDS Cutover

Only after local PostgreSQL works:

1. Create RDS PostgreSQL with Terraform.
2. Store credentials outside source control.
3. Produce a deployed `DATABASE_URL`.
4. Give App Runner network access to RDS.
5. Run migrations against RDS.
6. Run seeds against RDS.
7. Update App Runner env:
   - `DB_DIALECT=postgres`
   - `DATABASE_URL=...`
8. Redeploy App Runner.
9. Smoke test CloudFront -> App Runner -> RDS.

---

## Gotchas From This Repo

- `better-sqlite3` is a native module, so local Node version drift can break it. PostgreSQL removes that specific native
  module risk.
- Current auth tables use text UUIDs; decide whether to keep text IDs or convert to PostgreSQL `uuid`.
- Current translation tables use JSON stored through SQLite text mode; PostgreSQL should use `jsonb`.
- Current seed validation uses `sqliteBooleanField`; convert it before expecting PostgreSQL booleans to feel clean.
- Current migration reset logic is deeply SQLite-specific and should not be reused.
- Current App Runner deployment bakes a SQLite DB into the image during build; RDS cutover should remove that
  bootstrap pattern from the deployed start path.

---

## Recommended Commit Boundaries

Good commit slices:

1. Local PostgreSQL Docker setup and docs.
2. Env support for `DATABASE_URL` and `DB_DIALECT`.
3. PostgreSQL schema conversion.
4. PostgreSQL Drizzle config and migrations.
5. PostgreSQL migration/seed runners.
6. Local PostgreSQL validation fixes.
7. Terraform RDS resources.
8. App Runner RDS cutover.

Avoid one giant SQLite-to-RDS commit. It makes rollback, debugging, and interview explanation harder.
