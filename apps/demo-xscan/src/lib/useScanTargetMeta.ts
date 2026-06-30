import { REPOS } from 'data/repos';
import { useEffect, useState } from 'react';
import type { RepoMeta } from 'data/types';

export interface ScanTargetMeta {
  name: string;
  description: string | null;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function githubSlugFromUrl(repoUrl: string): string | null {
  try {
    const url = new URL(repoUrl);
    if (!['github.com', 'www.github.com'].includes(url.hostname)) {
      return null;
    }

    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repo) {
      return null;
    }

    return `${owner}/${repo}`;
  } catch {
    return null;
  }
}

function presetRepoForSlug(slug: string): RepoMeta | undefined {
  return REPOS.find((repo) => `${repo.owner}/${repo.repo}` === slug);
}

function metaFromRepo(repo: RepoMeta): ScanTargetMeta {
  return { name: repo.title, description: repo.description };
}

export function useScanTargetMeta(repo: RepoMeta | null, repoUrl: string | null): ScanTargetMeta | null {
  const [meta, setMeta] = useState<ScanTargetMeta | null>(null);

  useEffect(() => {
    if (repo) {
      setMeta(metaFromRepo(repo));
      return;
    }

    if (!repoUrl) {
      setMeta(null);
      return;
    }

    const slug = githubSlugFromUrl(repoUrl);
    const preset = slug ? presetRepoForSlug(slug) : undefined;
    if (preset) {
      setMeta(metaFromRepo(preset));
      return;
    }

    const controller = new AbortController();
    setMeta(slug ? { name: slug, description: null } : { name: repoUrl, description: null });

    void (async () => {
      try {
        const res = await fetch(apiUrl(`/api/github-repo?repoUrl=${encodeURIComponent(repoUrl)}`), {
          signal: controller.signal,
        });
        if (!res.ok) return;

        const data = (await res.json()) as { fullName: string; description: string | null };
        if (!controller.signal.aborted) {
          setMeta({
            name: data.fullName,
            description: data.description,
          });
        }
      } catch {
        // Keep slug fallback when metadata fetch fails.
      }
    })();

    return () => controller.abort();
  }, [repo, repoUrl]);

  return meta;
}
