import { DemoLayout } from '@workspace/shared/components';
import { RepoSelector } from 'components/RepoSelector/RepoSelector';
import { ScanPane } from 'components/ScanPane/ScanPane';
import { REPOS } from 'data/repos';
import { useState } from 'react';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  const selectedRepo = REPOS.find((r) => r.id === selectedId) ?? null;

  const handleRepoSelect = (repoId: string) => {
    setRepoUrl(null);
    setSelectedId(repoId);
  };

  const handleRepoUrlSubmit = (nextRepoUrl: string) => {
    setSelectedId(null);
    setRepoUrl(nextRepoUrl);
  };

  return (
    <DemoLayout
      header={{
        title: 'Dependency Scanner Demo',
        subtitle: 'xscan · GitHub lockfiles · Live terminal output',
      }}
      sidebar={
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <RepoSelector repos={REPOS} selectedId={selectedId} onSelect={handleRepoSelect} />
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
      <ScanPane repo={selectedRepo} repoUrl={repoUrl} onRepoUrlSubmit={handleRepoUrlSubmit} />
    </DemoLayout>
  );
}
