#!/usr/bin/env node
/**
 * Vendor xscan for the demo: copy built dist + install runtime dependencies locally.
 * No git submodules — run after building deps-xscan (`pnpm build`).
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const demoRoot = resolve(__dirname, '..');
const vendorRoot = join(demoRoot, 'vendor/xscan');
const defaultSourceRepo = resolve(demoRoot, '../../../@finografic-deps-xscan');
const sourceRepo = process.env.XSCAN_REPO ?? defaultSourceRepo;
const sourceDist = join(sourceRepo, 'dist');
const targetDist = join(vendorRoot, 'dist');

if (!existsSync(sourceDist)) {
  console.error(`[sync-xscan] Source dist not found: ${sourceDist}`);
  console.error('[sync-xscan] Build deps-xscan first: cd @finografic-deps-xscan && pnpm build');
  process.exit(1);
}

const sourcePkg = JSON.parse(readFileSync(join(sourceRepo, 'package.json'), 'utf-8'));
const dependencies = sourcePkg.dependencies ?? {};

mkdirSync(vendorRoot, { recursive: true });
cpSync(sourceDist, targetDist, { recursive: true, force: true });

const vendorPkg = {
  name: 'xscan-vendor',
  private: true,
  type: 'module',
  dependencies,
};

writeFileSync(join(vendorRoot, 'package.json'), `${JSON.stringify(vendorPkg, null, 2)}\n`, 'utf-8');

console.log(`[sync-xscan] Copied dist → ${targetDist}`);
console.log('[sync-xscan] Installing runtime dependencies in vendor/xscan…');

execSync('pnpm install --prod --ignore-workspace', {
  cwd: vendorRoot,
  stdio: 'inherit',
});

console.log('[sync-xscan] Done');
