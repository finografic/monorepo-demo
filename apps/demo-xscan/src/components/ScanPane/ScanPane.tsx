import { XscanTerminal } from 'components/XscanTerminal/XscanTerminal';
import type { RepoMeta } from 'data/types';

interface ScanPaneProps {
  repo: RepoMeta;
}

export function ScanPane({ repo }: ScanPaneProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex-none border-b border-border px-6 py-5">
        <h2 className="text-xl font-semibold text-foreground">{repo.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{repo.description}</p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Fetches lockfiles from GitHub, runs vendored{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">xscan</code> on the server
          {repo.dependabot ? ' with Dependabot alerts' : ''}.
        </p>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden p-4 pt-3">
        <XscanTerminal key={repo.id} repoId={repo.id} />
      </div>
    </div>
  );
}
