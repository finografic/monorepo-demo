import { db } from '../index';
import { translations_admin } from '../schemas';
import { translationsAdminSeedData } from './seed-data';

export async function seed() {
  console.log('  Seeding translations_admin...');

  const existing = await db.select().from(translations_admin).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ translations_admin already seeded, skipping...');
    return;
  }

  const inserted = await db
    .insert(translations_admin)
    .values(
      translationsAdminSeedData.map((item) => ({
        key: item.key,
        translations: item.translations,
        isActive: true,
      })),
    )
    .returning();

  console.log(`  ✓ Inserted ${inserted.length} admin translation entries`);
}
