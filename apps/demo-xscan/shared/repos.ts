export interface RepoMeta {
  id: string;
  owner: string;
  repo: string;
  title: string;
  description: string;
  tags: string[];
  dependabot: boolean;
}

export const REPOS: RepoMeta[] = [
  {
    id: 'deps-xscan',
    owner: 'finografic',
    repo: 'deps-xscan',
    title: 'finografic/deps-xscan',
    description: 'This scanner’s own repo — pnpm lockfile, GitHub Advisory + OSV coverage.',
    tags: ['pnpm', 'OSV.dev', 'GitHub Advisory', 'Self-scan'],
    dependabot: true,
  },
  {
    id: 'monorepo-demo',
    owner: 'finografic',
    repo: 'monorepo-demo',
    title: 'finografic/monorepo-demo',
    description: 'Portfolio monorepo with multiple apps — mixed dev toolchain dependencies.',
    tags: ['pnpm', 'Monorepo', 'Portfolio', 'Dependabot'],
    dependabot: true,
  },
  {
    id: 'cv-justin-rankin-v1',
    owner: 'finografic',
    repo: 'cv-justin-rankin-v1',
    title: 'finografic/cv-justin-rankin-v1',
    description: 'Legacy yarn project — demonstrates Dependabot digest parity (yarn lock pending).',
    tags: ['yarn', 'Legacy', 'Dependabot', 'CV site'],
    dependabot: true,
  },
];

export function findRepo(id: string): RepoMeta | undefined {
  return REPOS.find((r) => r.id === id);
}
