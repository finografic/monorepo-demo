import { db } from '../index';
import { translations_app } from '../schemas';

const data: Array<{ key: string; translations: Record<string, string> }> = [
  { key: 'app.title', translations: { 'en-GB': 'monorepo-demo', 'es-ES': 'monorepo-demo' } },
  {
    key: 'app.subtitle',
    translations: {
      'en-GB': 'Full-stack demo & portfolio pieces',
      'es-ES': 'Demo full-stack y pieza de portafolio',
    },
  },
  {
    key: 'app.description',
    translations: {
      'en-GB': 'A portfolio monorepo demo with Hono, React, Tailwind, and Auth.js.',
      'es-ES': 'Una demo de monorepo de portafolio con Hono, React, Tailwind y Auth.js.',
    },
  },
  { key: 'app.pages.home.title', translations: { 'en-GB': 'Welcome', 'es-ES': 'Bienvenido' } },
  {
    key: 'app.pages.home.hero',
    translations: { 'en-GB': 'Build fast, ship faster', 'es-ES': 'Construye rápido, entrega más rápido' },
  },
  { key: 'app.pages.home.cta', translations: { 'en-GB': 'Get started', 'es-ES': 'Comenzar' } },
  { key: 'app.pages.home.features', translations: { 'en-GB': 'Features', 'es-ES': 'Características' } },
  { key: 'app.pages.login.title', translations: { 'en-GB': 'Sign in', 'es-ES': 'Iniciar sesión' } },
  {
    key: 'app.pages.login.subtitle',
    translations: { 'en-GB': 'Welcome back', 'es-ES': 'Bienvenido de nuevo' },
  },
  {
    key: 'app.pages.login.cta',
    translations: { 'en-GB': 'Sign in to your account', 'es-ES': 'Acceder a tu cuenta' },
  },
  {
    key: 'app.pages.login.noAccount',
    translations: { 'en-GB': "Don't have an account?", 'es-ES': '¿No tienes una cuenta?' },
  },
  { key: 'app.pages.login.register', translations: { 'en-GB': 'Create account', 'es-ES': 'Crear cuenta' } },
];

export async function seed() {
  console.log('  Seeding translations_app...');

  const existing = await db.select().from(translations_app).limit(1);
  if (existing.length > 0) {
    console.log('  ✓ translations_app already seeded, skipping...');
    return;
  }

  const inserted = await db
    .insert(translations_app)
    .values(data.map((item) => ({ key: item.key, translations: item.translations, isActive: true })))
    .returning();

  console.log(`  ✓ Inserted ${inserted.length} app translation entries`);
}
