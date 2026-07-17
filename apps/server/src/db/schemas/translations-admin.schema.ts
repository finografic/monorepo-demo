import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const translations_admin = pgTable('translations_admin', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  translations: jsonb('translations').$type<Record<string, string>>().notNull().default({ 'en-GB': '' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

const insertTranslationAdminSchema = v.omit(
  createInsertSchema(translations_admin, {
    key: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
    translations: v.record(v.string(), v.string()),
    isActive: v.boolean(),
  }),
  ['id', 'createdAt', 'updatedAt'],
);

export const translationAdminSchemas = {
  select: createSelectSchema(translations_admin, {
    translations: v.optional(v.record(v.string(), v.string())),
  }),
  insert: insertTranslationAdminSchema,
  patch: v.partial(insertTranslationAdminSchema),
} as const;

export type TranslationAdminModel = v.InferOutput<typeof translationAdminSchemas.select>;
export type TranslationAdminInsert = v.InferOutput<typeof translationAdminSchemas.insert>;
export type TranslationAdminPatch = v.InferOutput<typeof translationAdminSchemas.patch>;
