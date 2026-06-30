import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { XscanTerminal } from 'components/XscanTerminal/XscanTerminal';
import { useEffect, useState } from 'react';
import type { RepoMeta } from 'data/types';

import { useScanTargetMeta } from 'lib/useScanTargetMeta';

interface ScanPaneProps {
  repo: RepoMeta | null;
  repoUrl: string | null;
  suggestions: RepoMeta[];
  onRepoUrlSubmit: (repoUrl: string) => void;
}

const GITHUB_REPO_URL_PATTERN = 'https://(www\\.)?github\\.com/[^/\\s]+/[^/\\s]+.*';

const XSCAN_TITLE = '@finografic/deps-xscan';
const XSCAN_SUBTITLE =
  'Dependency security scan: cross-checks your resolved dependency tree against OSV, Node.js advisories, and GitHub Advisory / Dependabot alerts.';

function repoUrlForSuggestion(repo: RepoMeta): string {
  return `https://github.com/${repo.owner}/${repo.repo}`;
}

export function ScanPane({ repo, repoUrl, suggestions, onRepoUrlSubmit }: ScanPaneProps) {
  const [repoUrlInput, setRepoUrlInput] = useState(repoUrl ?? '');
  const hasScanTarget = Boolean(repo || repoUrl);
  const targetMeta = useScanTargetMeta(repo, repoUrl);

  useEffect(() => {
    setRepoUrlInput(repoUrl ?? '');
  }, [repoUrl, repo?.id]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex-none px-6 py-5">
        <h2 className="text-xl font-semibold text-foreground">{XSCAN_TITLE}</h2>
        <a
          className="text-sm font-semibold text-primary underline"
          href="https://github.com/finografic/deps-xscan"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/finografic/deps-xscan
        </a>
        <p className="mt-1 text-sm text-muted-foreground">{XSCAN_SUBTITLE}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Scans your resolved lockfile dependency tree against:
        </p>
        <ul className="mt-3 grid list-disc grid-cols-2 gap-x-8 gap-y-1 pl-5 text-sm font-semibold text-muted-foreground">
          <li>OSV.dev</li>
          <li>Node.js runtime advisories</li>
          <li>GitHub Advisory Database</li>
          <li>optional Dependabot alerts</li>
        </ul>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden p-4 pt-2">
        <XscanTerminal
          key={repo?.id ?? repoUrl ?? 'standby'}
          repoId={repo?.id ?? null}
          repoUrl={repoUrl}
          standby={!hasScanTarget}
        />
      </div>

      <div className="flex flex-col px-6 pt-3">
        {hasScanTarget && targetMeta ? (
          <div>
            <h3 className="text-base font-bold text-foreground">{targetMeta.name}</h3>
            {targetMeta.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{targetMeta.description}</p>
            ) : null}
          </div>
        ) : (
          <div>
            <h3 className="text-base font-bold text-primary">Please enter a GitHub repository to scan</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a GitHub repository URL or select a repository in the sidebar to start a live dependency
              scan.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              Fetches lockfiles from GitHub, runs vendored{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono font-semibold text-[14px] text-primary">
                xscan
              </code>{' '}
              on the server.
            </p>
          </div>
        )}
      </div>

      <form
        className="flex flex-none flex-col gap-3 px-6 py-4 mb-8"
        onSubmit={(event) => {
          event.preventDefault();
          onRepoUrlSubmit(repoUrlInput.trim());
        }}
      >
        <label className="sr-only" htmlFor="github-repo-url">
          GitHub repository URL
        </label>
        <div className="flex gap-3 my-2">
          <Input
            id="github-repo-url"
            className="flex-1 border-2"
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
            Scan project vulnerabilities
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Suggestions:</span>
          {suggestions.map((suggestion) => {
            const suggestionUrl = repoUrlForSuggestion(suggestion);

            return (
              <button
                key={suggestion.id}
                className="rounded-full bg-sky-200 px-2.5 py-1 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-300"
                type="button"
                onClick={() => {
                  setRepoUrlInput(suggestionUrl);
                  onRepoUrlSubmit(suggestionUrl);
                }}
              >
                {suggestion.title}
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}
