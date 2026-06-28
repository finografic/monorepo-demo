import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { XSCAN_CLI } from './constants.js';
import { materializeGithubProject } from './materialize-github.js';

export interface ScanStreamOptions {
  owner: string;
  repo: string;
  dependabot: boolean;
  onChunk: (chunk: string) => void;
  onDone: (exitCode: number) => void;
  onError: (message: string) => void;
}

function cleanupProjectDir(directory: string | undefined): void {
  if (!directory) return;
  try {
    rmSync(directory, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
}

export async function streamGithubScan(options: ScanStreamOptions): Promise<void> {
  if (!existsSync(XSCAN_CLI)) {
    options.onError(
      `Vendored xscan not found at ${XSCAN_CLI}. Run: pnpm sync:xscan (after building deps-xscan).`,
    );
    options.onDone(2);
    return;
  }

  let projectDir: string | undefined;

  const finish = (exitCode: number) => {
    cleanupProjectDir(projectDir);
    options.onDone(exitCode);
  };

  try {
    const materialized = await materializeGithubProject(options.owner, options.repo);
    projectDir = materialized.directory;

    for (const warning of materialized.warnings) {
      options.onChunk(`\x1b[33m[demo]\x1b[0m ${warning}\n`);
    }
    options.onChunk(
      `\x1b[2m[demo] Materialized ${materialized.filesWritten.join(', ')} @ ${materialized.ref}\x1b[0m\n\n`,
    );

    const slug = `${options.owner}/${options.repo}`;
    const args = [
      'scan',
      '--project',
      materialized.directory,
      '--format',
      'terminal',
      ...(options.dependabot ? ['--dependabot', '--github-repo', slug] : []),
    ];

    options.onChunk(`\x1b[2m$ node ${XSCAN_CLI} ${args.join(' ')}\x1b[0m\n\n`);

    const child = spawn(process.execPath, [XSCAN_CLI, ...args], {
      cwd: resolve(XSCAN_CLI, '../..'),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (buf: Buffer) => options.onChunk(buf.toString('utf-8')));
    child.stderr.on('data', (buf: Buffer) => options.onChunk(buf.toString('utf-8')));

    child.on('error', (err) => {
      options.onError(err.message);
      finish(2);
    });

    child.on('close', (code) => {
      finish(code ?? 1);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    options.onError(message);
    finish(2);
  }
}
