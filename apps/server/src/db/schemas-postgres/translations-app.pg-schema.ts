import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const translations_app = pgTable('translations_app', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  translations: jsonb('translations').$type<Record<string, string>>().notNull().default({ 'en-GB': '' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
