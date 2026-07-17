import pc from 'picocolors';

import { closePostgres } from './db.postgres.adapter';
import { seed as seedSupportedLanguages } from './seeds/supported_languages.seed';
import { seed as seedTranslationsAdmin } from './seeds/translations_admin.seed';
import { seed as seedTranslationsApp } from './seeds/translations_app.seed';
import { seed as seedTranslationsUi } from './seeds/translations_ui.seed';
import { seed as seedUsers } from './seeds/user.seed';

async function main(): Promise<void> {
  console.log('');
  console.log(pc.bold('Seeding database…'));
  console.log('');

  await seedUsers();
  await seedSupportedLanguages();
  await seedTranslationsUi();
  await seedTranslationsApp();
  await seedTranslationsAdmin();

  console.log('');
  console.log(pc.green('✅ Seed complete'));
  console.log('');
}

main()
  .catch((err) => {
    console.error(pc.red('Seed failed:'), err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePostgres();
  });
