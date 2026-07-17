import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const translations_ui = pgTable('translations_ui', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  translations: jsonb('translations').$type<Record<string, string>>().notNull().default({ 'en-GB': '' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

const insertTranslationUiSchema = v.omit(
  createInsertSchema(translations_ui, {
    key: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
    translations: v.record(v.string(), v.string()),
    isActive: v.boolean(),
  }),
  ['id', 'createdAt', 'updatedAt'],
);

export const translationUiSchemas = {
  select: createSelectSchema(translations_ui, {
    translations: v.optional(v.record(v.string(), v.string())),
  }),
  insert: insertTranslationUiSchema,
  patch: v.partial(insertTranslationUiSchema),
} as const;

export type TranslationUiModel = v.InferOutput<typeof translationUiSchemas.select>;
export type TranslationUiInsert = v.InferOutput<typeof translationUiSchemas.insert>;
export type TranslationUiPatch = v.InferOutput<typeof translationUiSchemas.patch>;
