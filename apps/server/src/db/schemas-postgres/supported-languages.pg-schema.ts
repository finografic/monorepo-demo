import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const supported_languages = pgTable('supported_languages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  isoCode: text('iso_code').notNull().unique(),
  nativeName: text('native_name').notNull(),
  displayName: text('display_name').notNull(),
  flagCode: text('flag_code'),
  isActive: boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
