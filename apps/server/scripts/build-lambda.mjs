import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(serverRoot, 'dist-lambda');
const outfile = path.join(outDir, 'lambda.mjs');

const srcAlias = (name) => path.join(serverRoot, 'src', name);

await mkdir(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(serverRoot, 'src/lambda.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  logLevel: 'info',
  // Keep the Lambda package free of native / DB deps from the Render app.
  packages: 'bundle',
  alias: {
    db: srcAlias('db'),
    lib: srcAlias('lib'),
    middlewares: srcAlias('middlewares'),
    routes: srcAlias('routes'),
    types: srcAlias('types'),
    utils: srcAlias('utils'),
  },
  // Fail the build if something accidentally pulls SQLite into the Lambda artifact.
  plugins: [
    {
      name: 'reject-better-sqlite3',
      setup(build) {
        build.onResolve({ filter: /^better-sqlite3$/ }, () => {
          return {
            errors: [
              {
                text: 'better-sqlite3 must not be bundled into the Lambda artifact',
              },
            ],
          };
        });
      },
    },
  ],
});

await writeFile(
  path.join(outDir, 'package.json'),
  `${JSON.stringify({ type: 'module' }, null, 2)}\n`,
  'utf8',
);

console.log(`Lambda bundle written to ${outfile}`);
