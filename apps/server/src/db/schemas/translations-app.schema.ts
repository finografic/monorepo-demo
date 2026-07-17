import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';
import * as v from 'valibot';

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

const insertTranslationAppSchema = v.omit(
  createInsertSchema(translations_app, {
    key: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
    translations: v.record(v.string(), v.string()),
    isActive: v.boolean(),
  }),
  ['id', 'createdAt', 'updatedAt'],
);

export const translationAppSchemas = {
  select: createSelectSchema(translations_app, {
    translations: v.optional(v.record(v.string(), v.string())),
  }),
  insert: insertTranslationAppSchema,
  patch: v.partial(insertTranslationAppSchema),
} as const;

export type TranslationAppModel = v.InferOutput<typeof translationAppSchemas.select>;
export type TranslationAppInsert = v.InferOutput<typeof translationAppSchemas.insert>;
export type TranslationAppPatch = v.InferOutput<typeof translationAppSchemas.patch>;
