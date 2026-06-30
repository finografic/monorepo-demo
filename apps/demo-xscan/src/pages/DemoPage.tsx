import { DemoLayout } from '@workspace/shared/components';
import { ScanPane } from 'components/ScanPane/ScanPane';
import { REPOS } from 'data/repos';
import { useState } from 'react';

export function DemoPage() {
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  const handleRepoUrlSubmit = (nextRepoUrl: string) => {
    setRepoUrl(nextRepoUrl);
  };

  return (
    <DemoLayout
      header={{
        title: 'Dependency Scanner Demo',
        subtitle: 'xscan · GitHub lockfiles · Live terminal output',
      }}
      footer={<p className="text-sm text-primary-foreground">Vendored xscan dist · Server-side scan</p>}
    >
      <ScanPane repo={null} repoUrl={repoUrl} suggestions={REPOS} onRepoUrlSubmit={handleRepoUrlSubmit} />
    </DemoLayout>
  );
}
