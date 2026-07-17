import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(serverRoot, 'dist-lambda');
const outfile = path.join(outDir, 'lambda.js');

const srcAlias = (name) => path.join(serverRoot, 'src', name);

await mkdir(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(serverRoot, 'src/lambda.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  sourcemap: true,
  logLevel: 'info',
  packages: 'bundle',
  alias: {
    db: srcAlias('db'),
    lib: srcAlias('lib'),
    middlewares: srcAlias('middlewares'),
    routes: srcAlias('routes'),
    types: srcAlias('types'),
    utils: srcAlias('utils'),
  },
});

await writeFile(
  path.join(outDir, 'package.json'),
  `${JSON.stringify({ name: 'monorepo-demo-aws-lambda', version: '0.0.1' }, null, 2)}\n`,
  'utf8',
);

console.log(`Lambda bundle written to ${outfile}`);
