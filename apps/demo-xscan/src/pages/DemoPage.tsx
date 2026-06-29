import { DemoLayout } from '@workspace/shared/components';
import { RepoSelector } from 'components/RepoSelector/RepoSelector';
import { ScanPane } from 'components/ScanPane/ScanPane';
import { REPOS } from 'data/repos';
import { useState } from 'react';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRepo = REPOS.find((r) => r.id === selectedId) ?? null;

  return (
    <DemoLayout
      header={{
        title: 'Dependency Scanner Demo',
        subtitle: 'xscan · GitHub lockfiles · Live terminal output',
      }}
      sidebar={
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <RepoSelector repos={REPOS} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      }
      sidebarLabel="Repository navigation"
      footer={
        <p className="text-sm text-primary-foreground">
          Vendored xscan dist · Server-side scan
          <span className="mt-0.5 mx-4 text-primary-foreground/60">NPM_TOKEN for Dependabot</span>
        </p>
      }
    >
      {selectedRepo ? <ScanPane repo={selectedRepo} /> : <StandbyPlaceholder />}
    </DemoLayout>
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
