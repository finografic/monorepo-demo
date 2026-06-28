import { RepoSelector } from 'components/RepoSelector/RepoSelector';
import { ScanPane } from 'components/ScanPane/ScanPane';
import { REPOS } from 'data/repos';
import { useState } from 'react';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRepo = REPOS.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex-none bg-primary px-6 py-4">
        <h1 className="text-base font-semibold text-primary-foreground">Dependency Scanner Demo</h1>
        <p className="mt-0.5 text-sm text-primary-foreground/75">
          xscan · GitHub lockfiles · Live terminal output
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="flex w-[30rem] flex-none flex-col overflow-hidden border-r border-border lg:w-[32rem]"
          aria-label="Repository navigation"
        >
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <RepoSelector repos={REPOS} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <div className="border-t border-border px-5 py-3">
            <p className="text-center text-xs text-muted-foreground/60">
              Vendored xscan dist · Server-side scan · NPM_TOKEN for Dependabot
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          {selectedRepo ? <ScanPane repo={selectedRepo} /> : <StandbyPlaceholder />}
        </main>
      </div>
    </div>
  );
}

function StandbyPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex max-w-xs flex-col items-center gap-4 px-6 text-center">
        <div
          className="flex size-16 items-center justify-center rounded-2xl bg-primary/10"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-8 text-primary" aria-hidden="true">
            <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-base font-semibold text-foreground">Select a repository to scan</p>
        <p className="text-sm text-muted-foreground">
          Choose one of three public GitHub repos in the sidebar to run xscan in the integrated terminal.
        </p>
      </div>
    </div>
  );
}
