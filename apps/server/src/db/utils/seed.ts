import fs from 'node:fs';
import path from 'node:path';

import * as schemas from '../schemas';

const scriptDir = import.meta.dirname;

function isValidSchema(schema: string): boolean {
  return Object.keys(schemas).some(
    (key) =>
      key.toLowerCase() === `${schema}Schema` ||
      key.toLowerCase() === schema ||
      key.toLowerCase() === schema.replace(/-/g, '_'),
  );
}

async function seedSchema(schema: string): Promise<void> {
  try {
    if (!isValidSchema(schema)) {
      console.error(`❌ Invalid schema name: ${schema}`);
      console.log(
        `Available schemas: ${Object.keys(schemas)
          .filter((key) => !key.endsWith('Schema'))
          .join(', ')}`,
      );
      process.exit(1);
    }

    const seedFile = path.join(scriptDir, '../seeds', `${schema}.seed.ts`);

    if (!fs.existsSync(seedFile)) {
      console.warn(`⚠️ No seed file found for schema: ${schema}`);
      console.log(`Expected seed file at: ${seedFile}`);
      return;
    }

    const { seed } = await import(`../seeds/${schema}.seed.ts`);
    console.log(`🌱 Seeding ${schema}...`);
    await seed();
  } catch (error) {
    console.error(`❌ Error seeding ${schema}:`, error);
    throw error;
  }
}

const schema = process.argv[2]?.toLowerCase();

if (!schema) {
  console.error('❌ No schema specified');
  process.exit(1);
}

seedSchema(schema).catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
