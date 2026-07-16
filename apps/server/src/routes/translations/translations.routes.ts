import { db, translations_admin, translations_app, translations_ui } from 'db';
import { translationAdminSchemas, translationAppSchemas, translationUiSchemas } from 'db/schemas';
import { eq } from 'drizzle-orm';
import { describeRoute } from 'hono-openapi';
import * as v from 'valibot';

import { requireAuth } from 'lib/require-auth';
import { requireRole } from 'lib/require-role';

import type { ValidatedJsonContext } from 'types/app.types';

const translationPatchSchema = v.union([
  translationUiSchemas.patch,
  translationAppSchemas.patch,
  translationAdminSchemas.patch,
]);

type TranslationPatch = v.InferOutput<typeof translationPatchSchema>;

function normalisePatch(patch: {
  isActive?: 0 | 1 | undefined;
  key?: string | undefined;
  translations?: Record<string, string> | undefined;
}) {
  const { isActive, ...rest } = patch;
  return {
    ...rest,
    updatedAt: new Date(),
    ...(isActive !== undefined ? { isActive: isActive === 1 } : {}),
  };
}

export const update = {
  path: '/:domain/:id' as const,
  schema: translationPatchSchema,
  middleware: describeRoute({
    tags: ['translations'],
    summary: 'Update a translation entry',
    description: 'Admin only. Updates key, translations map, or isActive for a single entry.',
    responses: {
      200: { description: 'Updated translation entry' },
      400: { description: 'Validation error or unknown domain' },
      401: { description: 'Not authenticated' },
      403: { description: 'Not authorised' },
      404: { description: 'Entry not found' },
    },
  }),
  handler: async (c: ValidatedJsonContext<TranslationPatch, '/:domain/:id'>) => {
    const { domain, id } = c.req.param();
    if (!id) {
      return c.json({ error: 'VALIDATION_ERROR', message: 'Translation id is required' }, 400);
    }

    const patch = c.req.valid('json');

    switch (domain) {
      case 'ui': {
        const [updated] = await db
          .update(translations_ui)
          .set(normalisePatch(patch))
          .where(eq(translations_ui.id, id))
          .returning();
        if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Entry not found' }, 404);
        return c.json(updated, 200);
      }
      case 'app': {
        const [updated] = await db
          .update(translations_app)
          .set(normalisePatch(patch))
          .where(eq(translations_app.id, id))
          .returning();
        if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Entry not found' }, 404);
        return c.json(updated, 200);
      }
      case 'admin': {
        const [updated] = await db
          .update(translations_admin)
          .set(normalisePatch(patch))
          .where(eq(translations_admin.id, id))
          .returning();
        if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Entry not found' }, 404);
        return c.json(updated, 200);
      }
      default:
        return c.json({ error: 'VALIDATION_ERROR', message: `Unknown domain: ${domain}` }, 400);
    }
  },
};

export const requireAdmin = [requireAuth(), requireRole('admin')] as const;
