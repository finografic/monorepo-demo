export const userSeedData = [
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

export const supportedLanguagesSeedData = [
  {
    isoCode: 'en-GB',
    nativeName: 'English',
    displayName: 'English (United Kingdom)',
    flagCode: 'GB',
    isActive: true,
    isDefault: true,
    sortOrder: 1,
  },
  {
    isoCode: 'es-ES',
    nativeName: 'Español',
    displayName: 'Spanish (Spain)',
    flagCode: 'ES',
    isActive: true,
    isDefault: false,
    sortOrder: 2,
  },
];

export const translationsUiSeedData: Array<{ key: string; translations: Record<string, string> }> = [
  { key: 'ui.buttons.save', translations: { 'en-GB': 'Save', 'es-ES': 'Guardar' } },
  { key: 'ui.buttons.cancel', translations: { 'en-GB': 'Cancel', 'es-ES': 'Cancelar' } },
  { key: 'ui.buttons.create', translations: { 'en-GB': 'Create', 'es-ES': 'Crear' } },
  { key: 'ui.buttons.edit', translations: { 'en-GB': 'Edit', 'es-ES': 'Editar' } },
  { key: 'ui.buttons.delete', translations: { 'en-GB': 'Delete', 'es-ES': 'Eliminar' } },
  { key: 'ui.buttons.back', translations: { 'en-GB': 'Back', 'es-ES': 'Volver' } },
  { key: 'ui.buttons.submit', translations: { 'en-GB': 'Submit', 'es-ES': 'Enviar' } },
  { key: 'ui.common.loading', translations: { 'en-GB': 'Loading…', 'es-ES': 'Cargando…' } },
  { key: 'ui.common.error', translations: { 'en-GB': 'An error occurred', 'es-ES': 'Se produjo un error' } },
  { key: 'ui.common.success', translations: { 'en-GB': 'Success', 'es-ES': 'Éxito' } },
  { key: 'ui.common.notFound', translations: { 'en-GB': 'Not found', 'es-ES': 'No encontrado' } },
  { key: 'ui.common.required', translations: { 'en-GB': 'Required', 'es-ES': 'Obligatorio' } },
  { key: 'ui.nav.home', translations: { 'en-GB': 'Home', 'es-ES': 'Inicio' } },
  { key: 'ui.nav.admin', translations: { 'en-GB': 'Admin', 'es-ES': 'Administración' } },
  { key: 'ui.nav.login', translations: { 'en-GB': 'Login', 'es-ES': 'Iniciar sesión' } },
  { key: 'ui.nav.logout', translations: { 'en-GB': 'Logout', 'es-ES': 'Cerrar sesión' } },
  { key: 'ui.nav.settings', translations: { 'en-GB': 'Settings', 'es-ES': 'Configuración' } },
  { key: 'ui.table.noResults', translations: { 'en-GB': 'No results found', 'es-ES': 'Sin resultados' } },
  { key: 'ui.table.actions', translations: { 'en-GB': 'Actions', 'es-ES': 'Acciones' } },
  { key: 'ui.form.email', translations: { 'en-GB': 'Email', 'es-ES': 'Correo electrónico' } },
  { key: 'ui.form.password', translations: { 'en-GB': 'Password', 'es-ES': 'Contraseña' } },
  { key: 'ui.form.name', translations: { 'en-GB': 'Name', 'es-ES': 'Nombre' } },
];

export const translationsAppSeedData: Array<{ key: string; translations: Record<string, string> }> = [
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

export const translationsAdminSeedData: Array<{ key: string; translations: Record<string, string> }> = [
  { key: 'admin.title', translations: { 'en-GB': 'Admin Panel', 'es-ES': 'Panel de administración' } },
  {
    key: 'admin.subtitle',
    translations: { 'en-GB': 'Manage your application', 'es-ES': 'Gestiona tu aplicación' },
  },
  { key: 'admin.nav.dashboard', translations: { 'en-GB': 'Dashboard', 'es-ES': 'Panel principal' } },
  { key: 'admin.nav.users', translations: { 'en-GB': 'Users', 'es-ES': 'Usuarios' } },
  { key: 'admin.nav.translations', translations: { 'en-GB': 'Translations', 'es-ES': 'Traducciones' } },
  { key: 'admin.nav.settings', translations: { 'en-GB': 'Settings', 'es-ES': 'Configuración' } },
  { key: 'admin.pages.dashboard.title', translations: { 'en-GB': 'Dashboard', 'es-ES': 'Panel principal' } },
  {
    key: 'admin.pages.dashboard.welcome',
    translations: { 'en-GB': 'Welcome to the admin panel', 'es-ES': 'Bienvenido al panel de administración' },
  },
  { key: 'admin.pages.users.title', translations: { 'en-GB': 'Users', 'es-ES': 'Usuarios' } },
  { key: 'admin.pages.users.create', translations: { 'en-GB': 'New user', 'es-ES': 'Nuevo usuario' } },
  { key: 'admin.pages.users.role', translations: { 'en-GB': 'Role', 'es-ES': 'Rol' } },
  { key: 'admin.pages.users.roles.admin', translations: { 'en-GB': 'Admin', 'es-ES': 'Administrador' } },
  { key: 'admin.pages.users.roles.user', translations: { 'en-GB': 'User', 'es-ES': 'Usuario' } },
  {
    key: 'admin.pages.translations.title',
    translations: { 'en-GB': 'Translations', 'es-ES': 'Traducciones' },
  },
  { key: 'admin.pages.translations.domain.ui', translations: { 'en-GB': 'UI', 'es-ES': 'Interfaz' } },
  {
    key: 'admin.pages.translations.domain.app',
    translations: { 'en-GB': 'Application', 'es-ES': 'Aplicación' },
  },
  {
    key: 'admin.pages.translations.domain.admin',
    translations: { 'en-GB': 'Admin', 'es-ES': 'Administración' },
  },
  { key: 'admin.pages.settings.title', translations: { 'en-GB': 'Settings', 'es-ES': 'Configuración' } },
  { key: 'admin.pages.settings.language', translations: { 'en-GB': 'Language', 'es-ES': 'Idioma' } },
];
