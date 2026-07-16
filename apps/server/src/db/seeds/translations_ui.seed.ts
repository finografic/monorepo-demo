import { db } from '../index';
import { translations_ui } from '../schemas';
import { translationsUiSeedData } from './seed-data';

export async function seed() {
  console.log('  Seeding translations_ui...');

  const existing = await db.select().from(translations_ui).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ translations_ui already seeded, skipping...');
    return;
  }

  const inserted = await db
    .insert(translations_ui)
    .values(
      translationsUiSeedData.map((item) => ({
        key: item.key,
        translations: item.translations,
        isActive: true,
      })),
    )
    .returning();

  console.log(`  ✓ Inserted ${inserted.length} UI translation entries`);
}
