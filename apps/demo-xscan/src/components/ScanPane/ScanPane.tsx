import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { XscanTerminal } from 'components/XscanTerminal/XscanTerminal';
import { useState } from 'react';
import type { RepoMeta } from 'data/types';

interface ScanPaneProps {
  repo: RepoMeta | null;
  repoUrl: string | null;
  onRepoUrlSubmit: (repoUrl: string) => void;
}

const GITHUB_REPO_URL_PATTERN = 'https://(www\\.)?github\\.com/[^/\\s]+/[^/\\s]+.*';

function repoTitle(repo: RepoMeta | null, repoUrl: string | null): string {
  if (repo) return repo.title;
  if (repoUrl) return repoUrl.replace(/^https:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
  return 'Scanner terminal standby';
}

export function ScanPane({ repo, repoUrl, onRepoUrlSubmit }: ScanPaneProps) {
  const [repoUrlInput, setRepoUrlInput] = useState(repoUrl ?? '');
  const hasScanTarget = Boolean(repo || repoUrl);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex-none border-b border-border px-6 py-5">
        <h2 className="text-xl font-semibold text-foreground">{repoTitle(repo, repoUrl)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {repo
            ? repo.description
            : 'Enter a GitHub repository URL or select a repository in the sidebar to start a live dependency scan.'}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Fetches lockfiles from GitHub, runs vendored{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">xscan</code> on the server
          {repo?.dependabot ? ' with Dependabot alerts' : ''}.
        </p>
      </header>

      <form
        className="flex flex-none gap-3 border-b border-border px-6 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          onRepoUrlSubmit(repoUrlInput.trim());
        }}
      >
        <label className="sr-only" htmlFor="github-repo-url">
          GitHub repository URL
        </label>
        <Input
          id="github-repo-url"
          className="flex-1"
          type="url"
          inputMode="url"
          pattern={GITHUB_REPO_URL_PATTERN}
          placeholder="https://github.com/owner/repo"
          title="Enter a GitHub repository URL, for example https://github.com/owner/repo"
          value={repoUrlInput}
          onChange={(event) => setRepoUrlInput(event.target.value)}
          required
        />
        <Button type="submit" className="min-h-11 px-5 text-sm font-semibold">
          Search
        </Button>
      </form>

      <div className="flex flex-1 flex-col overflow-hidden p-4 pt-3">
        <XscanTerminal
          key={repo?.id ?? repoUrl ?? 'standby'}
          repoId={repo?.id ?? null}
          repoUrl={repoUrl}
          standby={!hasScanTarget}
        />
      </div>
    </div>
  );
}
