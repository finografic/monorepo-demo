import { db } from '../index';
import { translations_app } from '../schemas';
import { translationsAppSeedData } from './seed-data';

export async function seed() {
  console.log('  Seeding translations_app...');

  const existing = await db.select().from(translations_app).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ translations_app already seeded, skipping...');
    return;
  }

  const inserted = await db
    .insert(translations_app)
    .values(
      translationsAppSeedData.map((item) => ({
        key: item.key,
        translations: item.translations,
        isActive: true,
      })),
    )
    .returning();

  console.log(`  ✓ Inserted ${inserted.length} app translation entries`);
}
