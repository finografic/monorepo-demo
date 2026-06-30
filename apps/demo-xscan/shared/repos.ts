export type SuggestionTone = 'findings' | 'maintained' | 'large';

export interface RepoMeta {
  id: string;
  owner: string;
  repo: string;
  title: string;
  description: string;
  tags: string[];
  dependabot: boolean;
  suggestionTone: SuggestionTone;
}

/** Curated suggestion pills for the scan URL form — mix of findings demos and maintained controls. */
export const REPOS: RepoMeta[] = [
  {
    id: 'dvna',
    owner: 'appsecco',
    repo: 'dvna',
    title: 'appsecco/dvna',
    description:
      'Damn Vulnerable NodeJS Application — intentionally vulnerable Node app, useful for fast security-demo output.',
    tags: ['npm', 'Vulnerable demo', 'Node.js', 'Training app'],
    dependabot: true,
    suggestionTone: 'findings',
  },
  {
    id: 'nodejs-goof',
    owner: 'snyk-labs',
    repo: 'nodejs-goof',
    title: 'snyk-labs/nodejs-goof',
    description: 'Intentionally vulnerable Node.js demo app with npm lockfile coverage.',
    tags: ['npm', 'Vulnerable demo', 'Snyk'],
    dependabot: true,
    suggestionTone: 'findings',
  },
  {
    id: 'nodegoat',
    owner: 'OWASP',
    repo: 'NodeGoat',
    title: 'OWASP/NodeGoat',
    description: 'OWASP vulnerable Node.js training app with dependency history worth scanning.',
    tags: ['npm', 'OWASP', 'Training app'],
    dependabot: true,
    suggestionTone: 'findings',
  },
  {
    id: 'juice-shop',
    owner: 'juice-shop',
    repo: 'juice-shop',
    title: 'juice-shop/juice-shop',
    description:
      'OWASP Juice Shop — intentionally vulnerable web app; high-signal security demo, but test scan time first.',
    tags: ['npm', 'OWASP', 'Vulnerable demo', 'Security training'],
    dependabot: true,
    suggestionTone: 'findings',
  },
  {
    id: 'express',
    owner: 'expressjs',
    repo: 'express',
    title: 'expressjs/express',
    description:
      'Popular Node.js web framework with a smaller dependency footprint than large frontend/tooling monorepos.',
    tags: ['npm', 'Node.js', 'Framework', 'API'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'koa',
    owner: 'koajs',
    repo: 'koa',
    title: 'koajs/koa',
    description: 'Lightweight Node.js web framework; useful as a smaller maintained framework scan.',
    tags: ['npm', 'Node.js', 'Framework', 'Middleware'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'fastify',
    owner: 'fastify',
    repo: 'fastify',
    title: 'fastify/fastify',
    description:
      'Maintained Node.js web framework; realistic API project without being as huge as full platform repos.',
    tags: ['npm', 'Node.js', 'Framework', 'API'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'commander',
    owner: 'tj',
    repo: 'commander.js',
    title: 'tj/commander.js',
    description: 'Popular CLI library; useful for showing scanner behaviour on a smaller JavaScript package.',
    tags: ['npm', 'CLI', 'Library'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'marked',
    owner: 'markedjs',
    repo: 'marked',
    title: 'markedjs/marked',
    description:
      'Markdown parser library; relevant to the AI markdown pipeline demo and typically much smaller than app repos.',
    tags: ['npm', 'Markdown', 'Parser', 'Library'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'validator',
    owner: 'validatorjs',
    repo: 'validator.js',
    title: 'validatorjs/validator.js',
    description:
      'Input validation library; nice security-adjacent scan target with a manageable dependency profile.',
    tags: ['npm', 'Validation', 'Security', 'Library'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'jsonwebtoken',
    owner: 'auth0',
    repo: 'node-jsonwebtoken',
    title: 'auth0/node-jsonwebtoken',
    description: 'JWT/auth library; good security-relevant target for demonstrating advisory scanning.',
    tags: ['npm', 'Auth', 'JWT', 'Security'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'axios',
    owner: 'axios',
    repo: 'axios',
    title: 'axios/axios',
    description: 'Popular HTTP client library with package-lock scan inputs.',
    tags: ['npm', 'HTTP client', 'Library'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'node-fetch',
    owner: 'node-fetch',
    repo: 'node-fetch',
    title: 'node-fetch/node-fetch',
    description:
      'HTTP client library; smaller and more focused than full application/framework repositories.',
    tags: ['npm', 'HTTP client', 'Library'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
];

/** Earlier candidate set kept for reference and heavier scan experiments. */
export const REPOS_V1: RepoMeta[] = [
  {
    id: 'deps-xscan',
    owner: 'finografic',
    repo: 'deps-xscan',
    title: 'finografic/deps-xscan',
    description: 'This scanner’s own repo — pnpm lockfile, GitHub Advisory + OSV coverage.',
    tags: ['pnpm', 'OSV.dev', 'GitHub Advisory', 'Self-scan'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'cv-justin-rankin-v1',
    owner: 'finografic',
    repo: 'cv-justin-rankin-v1',
    title: 'finografic/cv-justin-rankin-v1',
    description: 'Legacy yarn project — demonstrates Dependabot digest parity (yarn lock pending).',
    tags: ['yarn', 'Legacy', 'Dependabot', 'CV site'],
    dependabot: true,
    suggestionTone: 'maintained',
  },
  {
    id: 'vulnerable-nodejs-application',
    owner: 'asecurityguru',
    repo: 'vulnerablenodejsapplication',
    title: 'asecurityguru/vulnerablenodejsapplication',
    description: 'Small vulnerable Node.js app with package-lock scan inputs.',
    tags: ['npm', 'Vulnerable demo', 'Training app'],
    dependabot: true,
    suggestionTone: 'findings',
  },
  {
    id: 'create-react-app',
    owner: 'facebook',
    repo: 'create-react-app',
    title: 'facebook/create-react-app',
    description: 'Archived React tooling project with a package-lock for realistic dependency output.',
    tags: ['npm', 'Archived', 'React'],
    dependabot: true,
    suggestionTone: 'large',
  },
  {
    id: 'pdf-js',
    owner: 'mozilla',
    repo: 'pdf.js',
    title: 'mozilla/pdf.js',
    description: 'Large browser JavaScript project with npm lockfile scan coverage.',
    tags: ['npm', 'Browser', 'PDF'],
    dependabot: true,
    suggestionTone: 'large',
  },
  {
    id: 'serverless',
    owner: 'serverless',
    repo: 'serverless',
    title: 'serverless/serverless',
    description: 'Medium-to-large CLI framework with a package-lock dependency graph.',
    tags: ['npm', 'CLI', 'Framework'],
    dependabot: true,
    suggestionTone: 'large',
  },
  {
    id: 'npm-cli',
    owner: 'npm',
    repo: 'cli',
    title: 'npm/cli',
    description: 'npm CLI repository with first-party package-lock coverage.',
    tags: ['npm', 'CLI', 'Package manager'],
    dependabot: true,
    suggestionTone: 'large',
  },
  {
    id: 'prisma',
    owner: 'prisma',
    repo: 'prisma',
    title: 'prisma/prisma',
    description: 'Maintained ORM project with pnpm lockfile coverage; useful as a greener control.',
    tags: ['pnpm', 'Maintained', 'Control'],
    dependabot: true,
    suggestionTone: 'large',
  },
  {
    id: 'vite',
    owner: 'vitejs',
    repo: 'vite',
    title: 'vitejs/vite',
    description:
      'Maintained frontend tooling project with pnpm lockfile coverage; pnpm monorepo — test scan time first.',
    tags: ['pnpm', 'Maintained', 'Control'],
    dependabot: true,
    suggestionTone: 'large',
  },
];

export function findRepo(id: string): RepoMeta | undefined {
  return REPOS.find((r) => r.id === id) ?? REPOS_V1.find((r) => r.id === id);
}
