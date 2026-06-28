const config = {
  sortAz: [
    'bin',
    'contributors',
    'dependencies',
    'devDependencies',
    'keywords',
    'peerDependencies',
    'resolutions',
  ],

  sortFirst: [
    // identity
    'name',
    'version',
    'private',
    // metadata (root package)
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'repository',
    // module shape
    'type',
    'main',
    'module',
    'types',
    'exports',
    'files',
    // scripts
    'scripts',
    // deps
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    // runtime / tooling (root package)
    'engines',
    'packageManager',
    'lint-staged',
  ],

  versionGroups: [
    {
      label: 'workspace packages — ignore',
      dependencies: ['@workspace/*'],
      isIgnored: true,
    },
    {
      label: 'pinned cross-workspace versions',
      dependencies: [
        // finografic tooling
        '@finografic/md-lint',
        '@finografic/oxc-config',
        '@finografic/project-scripts',
        // node types + runtime
        '@types/node',
        // react core
        '@types/react',
        '@types/react-dom',
        'react',
        'react-dom',
        // tanstack
        '@tanstack/react-query',
        '@tanstack/react-table',
        // i18n
        'i18next',
        'i18next-browser-languagedetector',
        'i18next-http-backend',
        'react-i18next',
        // routing
        'react-router-dom',
        // markdown pipeline (demo-ai-pipeline)
        'mermaid',
        'react-markdown',
        'rehype-sanitize',
        'remark-gfm',
        'shiki',
        // styling
        '@tailwindcss/vite',
        'tailwindcss',
        // build tooling
        '@vitejs/plugin-react',
        'tsdown',
        'vite',
        'vitest',
        // database
        '@types/better-sqlite3',
        'drizzle-kit',
        'drizzle-orm',
        // server
        'hono',
        // validation
        'valibot',
        // linting + formatting
        'oxfmt',
        'oxlint',
        'oxlint-tsgolint',
        // testing
        '@testing-library/react',
        '@testing-library/user-event',
        // shared utilities
        'picocolors',
        'syncpack',
        'tsx',
        'typescript',
      ],
      packages: ['**'],
    },
  ],

  semverGroups: [
    {
      label: 'workspace refs — ignore semver',
      dependencies: ['@workspace/*'],
      isIgnored: true,
    },
    {
      label: 'all deps use ^ range',
      range: '^',
      packages: ['**'],
      dependencies: ['**'],
    },
  ],
};

export default config;
