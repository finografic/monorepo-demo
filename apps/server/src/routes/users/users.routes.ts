import { getAuthUser } from '@hono/auth-js';
import { db, user } from 'db';
import { eq } from 'drizzle-orm';
import { describeRoute } from 'hono-openapi';
import * as v from 'valibot';

import { requireAuth } from 'lib/require-auth';
import { requireRole } from 'lib/require-role';

import type { AppContext, ValidatedJsonContext } from 'types/app.types';

const userUpdateBodySchema = v.object({
  name: v.optional(v.string()),
  role: v.optional(v.picklist(['public', 'user', 'admin'])),
});

type UserUpdateBody = v.InferOutput<typeof userUpdateBodySchema>;

export const list = {
  path: '/' as const,
  middleware: describeRoute({
    tags: ['users'],
    summary: 'List all users',
    description: 'Returns all user accounts. Requires admin role.',
    responses: {
      200: { description: 'User list' },
      401: { description: 'Not authenticated' },
      403: { description: 'Not authorised' },
    },
  }),
  handler: async (c: AppContext) => {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    return c.json(users, 200);
  },
};

export const update = {
  path: '/:id' as const,
  schema: userUpdateBodySchema,
  middleware: describeRoute({
    tags: ['users'],
    summary: 'Update a user',
    description: 'Admin can update any field. A user may only update their own name.',
    responses: {
      200: { description: 'Updated user' },
      400: { description: 'Validation error' },
      401: { description: 'Not authenticated' },
      403: { description: 'Not authorised' },
      404: { description: 'User not found' },
    },
  }),
  handler: async (c: ValidatedJsonContext<UserUpdateBody, '/:id'>) => {
    const { id } = c.req.param();
    if (!id) return c.json({ error: 'VALIDATION_ERROR', message: 'User id is required' }, 400);

    const authUser = await getAuthUser(c);

    const requestingId = authUser?.session?.user?.id;
    const requestingRole = (authUser?.session?.user as { role?: string } | undefined)?.role ?? 'user';

    const patch = c.req.valid('json');

    if (patch.role !== undefined && requestingRole !== 'admin') {
      return c.json({ error: 'FORBIDDEN', message: 'Only admins can change roles' }, 403);
    }
    if (requestingRole !== 'admin' && requestingId !== id) {
      return c.json({ error: 'FORBIDDEN', message: 'Cannot update another user' }, 403);
    }

    const [updated] = await db
      .update(user)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    if (!updated) return c.json({ error: 'NOT_FOUND', message: 'User not found' }, 404);

    return c.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role }, 200);
  },
};

export const remove = {
  path: '/:id' as const,
  middleware: describeRoute({
    tags: ['users'],
    summary: 'Delete a user',
    description: 'Permanently removes a user account. Requires admin role.',
    responses: {
      200: { description: 'User deleted' },
      401: { description: 'Not authenticated' },
      403: { description: 'Not authorised' },
      404: { description: 'User not found' },
    },
  }),
  handler: async (c: AppContext) => {
    const { id } = c.req.param();
    if (!id) return c.json({ error: 'VALIDATION_ERROR', message: 'User id is required' }, 400);

    const [deleted] = await db.delete(user).where(eq(user.id, id)).returning({ id: user.id });
    if (!deleted) return c.json({ error: 'NOT_FOUND', message: 'User not found' }, 404);
    return c.json({ success: true }, 200);
  },
};

export const requireAdmin = [requireAuth(), requireRole('admin')] as const;
export const requireUser = requireAuth();
