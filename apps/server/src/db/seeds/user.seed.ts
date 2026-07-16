import { hashPassword } from 'utils/password.utils';

import { db } from '../index';
import { user } from '../schemas';
import { userSeedData } from './seed-data';

export async function seed() {
  console.log('  Seeding users...');

  const existing = await db.select().from(user).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ users already seeded, skipping...');
    return;
  }

  for (const userData of userSeedData) {
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
