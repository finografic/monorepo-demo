import type { ServerResponse } from 'node:http';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';

import { findRepo } from './repos.js';
import { streamGithubScan } from './run-scan.js';

interface ScanTarget {
  owner: string;
  repo: string;
  dependabot: boolean;
}

function writeSse(res: ServerResponse, event: string, data: string): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function scanTargetFromGithubUrl(repoUrl: string): ScanTarget | null {
  try {
    const url = new URL(repoUrl);
    if (!['github.com', 'www.github.com'].includes(url.hostname)) {
      return null;
    }

    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repo) {
      return null;
    }

    return { owner, repo, dependabot: true };
  } catch {
    return null;
  }
}

function attachScanMiddleware(server: Pick<ViteDevServer | PreviewServer, 'middlewares'>): void {
  server.middlewares.use('/api/scan', (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://localhost');
    const repoId = url.searchParams.get('repoId');
    const repoUrl = url.searchParams.get('repoUrl');
    if (!repoId && !repoUrl) {
      res.statusCode = 400;
      res.end('Missing repoId or repoUrl');
      return;
    }

    const target = repoUrl ? scanTargetFromGithubUrl(repoUrl) : repoId ? findRepo(repoId) : null;
    if (!target) {
      res.statusCode = repoUrl ? 400 : 404;
      res.end(repoUrl ? `Invalid GitHub repository URL: ${repoUrl}` : `Unknown repoId: ${repoId}`);
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    writeSse(res, 'start', `${target.owner}/${target.repo}`);

    void streamGithubScan({
      owner: target.owner,
      repo: target.repo,
      dependabot: target.dependabot,
      onChunk: (chunk) => writeSse(res, 'output', chunk),
      onError: (message) => writeSse(res, 'error', message),
      onDone: (exitCode) => {
        writeSse(res, 'exit', String(exitCode));
        res.end();
      },
    });
  });
}

export function scanApiPlugin(): Plugin {
  return {
    name: 'demo-xscan-api',
    configureServer(server) {
      attachScanMiddleware(server);
    },
    configurePreviewServer(server) {
      attachScanMiddleware(server);
    },
  };
}
