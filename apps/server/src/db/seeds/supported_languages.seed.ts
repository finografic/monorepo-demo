import { db } from '../index';
import { supported_languages } from '../schemas';
import { supportedLanguagesSeedData } from './seed-data';

export async function seed() {
  console.log('  Seeding supported_languages...');

  const existing = await db.select().from(supported_languages).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ supported_languages already seeded, skipping...');
    return;
  }

  const inserted = await db.insert(supported_languages).values(supportedLanguagesSeedData).returning();

  console.log(`  ✓ Inserted ${inserted.length} languages`);
}
