import { hashPassword } from 'utils/password.utils';

import { db } from '../index';
import { user } from '../schemas';

export async function seed() {
  console.log('  Seeding users...');

  const existing = await db.select().from(user).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ users already seeded, skipping...');
    return;
  }

  const usersToCreate = [
    {
      email: 'admin@test.com',
      password: 'test1234',
      name: 'Admin User',
      role: 'admin' as const,
    },
    {
      email: 'guest@test.com',
      password: 'test1234',
      name: 'Guest User',
      role: 'user' as const,
    },
  ];

  for (const userData of usersToCreate) {
    const hashedPw = await hashPassword(userData.password);
    const now = new Date();

    await db.insert(user).values({
      name: userData.name,
      email: userData.email,
      hashedPassword: hashedPw,
      emailVerified: false,
      role: userData.role,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`  ✓ Created ${userData.role}: ${userData.email}`);
  }
}
