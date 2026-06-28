import type { ServerResponse } from 'node:http';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';

import { findRepo } from './repos.js';
import { streamGithubScan } from './run-scan.js';

function writeSse(res: ServerResponse, event: string, data: string): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function attachScanMiddleware(server: Pick<ViteDevServer | PreviewServer, 'middlewares'>): void {
  server.middlewares.use('/api/scan', (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://localhost');
    const repoId = url.searchParams.get('repoId');
    if (!repoId) {
      res.statusCode = 400;
      res.end('Missing repoId');
      return;
    }

    const meta = findRepo(repoId);
    if (!meta) {
      res.statusCode = 404;
      res.end(`Unknown repoId: ${repoId}`);
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    writeSse(res, 'start', `${meta.owner}/${meta.repo}`);

    void streamGithubScan({
      owner: meta.owner,
      repo: meta.repo,
      dependabot: meta.dependabot,
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
