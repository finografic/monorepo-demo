import pc from 'picocolors';

import { hashPassword } from 'utils/password.utils';

import { closePostgres, postgresDb as db } from './db.postgres.adapter';
import {
  supported_languages,
  translations_admin,
  translations_app,
  translations_ui,
  user,
} from './schemas-postgres';
import {
  supportedLanguagesSeedData,
  translationsAdminSeedData,
  translationsAppSeedData,
  translationsUiSeedData,
  userSeedData,
} from './seeds/seed-data';

async function seedUsers() {
  const existing = await db.select().from(user).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ users already seeded, skipping...');
    return;
  }

  for (const userData of userSeedData) {
    const now = new Date();

    await db.insert(user).values({
      name: userData.name,
      email: userData.email,
      hashedPassword: await hashPassword(userData.password),
      emailVerified: false,
      role: userData.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`  ✓ Inserted ${userSeedData.length} users`);
}

async function seedSupportedLanguages() {
  const existing = await db.select().from(supported_languages).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ supported_languages already seeded, skipping...');
    return;
  }

  const inserted = await db.insert(supported_languages).values(supportedLanguagesSeedData).returning();

  console.log(`  ✓ Inserted ${inserted.length} languages`);
}

async function seedTranslations() {
  const existing = await db.select().from(translations_ui).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ translations already seeded, skipping...');
    return;
  }

  const ui = await db
    .insert(translations_ui)
    .values(translationsUiSeedData.map((item) => ({ ...item, isActive: true })))
    .returning();
  const app = await db
    .insert(translations_app)
    .values(translationsAppSeedData.map((item) => ({ ...item, isActive: true })))
    .returning();
  const admin = await db
    .insert(translations_admin)
    .values(translationsAdminSeedData.map((item) => ({ ...item, isActive: true })))
    .returning();

  console.log(`  ✓ Inserted ${ui.length + app.length + admin.length} translation entries`);
}

async function main() {
  console.log('');
  console.log(pc.bold('Seeding PostgreSQL database...'));
  console.log('');

  await seedUsers();
  await seedSupportedLanguages();
  await seedTranslations();

  console.log('');
  console.log(pc.green('✅ PostgreSQL seed complete'));
  console.log('');
}

main()
  .catch((err) => {
    console.error(pc.red('PostgreSQL seed failed:'), err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePostgres();
  });
