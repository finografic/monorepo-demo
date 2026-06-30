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
const vendorPackagePath = join(vendorRoot, 'package.json');

const SHOULD_USE_SPINNERS_NEEDLE = 'return (process.stdout.isTTY ?? false) && !verbose;';
const SHOULD_USE_SPINNERS_PATCH =
  'return ((process.stdout.isTTY ?? false) || process.env.DEMO_XSCAN_FORCE_PROGRESS === "1") && !verbose;';

function patchDemoScanDist(distIndexPath) {
  if (!existsSync(distIndexPath)) {
    return;
  }

  const source = readFileSync(distIndexPath, 'utf8');
  if (source.includes('DEMO_XSCAN_FORCE_PROGRESS')) {
    return;
  }

  if (!source.includes(SHOULD_USE_SPINNERS_NEEDLE)) {
    console.warn('[sync-xscan] shouldUseSpinners pattern not found — skip demo progress patch');
    return;
  }

  writeFileSync(distIndexPath, source.replace(SHOULD_USE_SPINNERS_NEEDLE, SHOULD_USE_SPINNERS_PATCH), 'utf-8');
  console.log('[sync-xscan] Patched dist for DEMO_XSCAN_FORCE_PROGRESS fallback');
}

if (!existsSync(sourceDist)) {
  if (existsSync(targetDist) && existsSync(vendorPackagePath)) {
    console.warn(`[sync-xscan] Source dist not found: ${sourceDist}`);
    console.warn('[sync-xscan] Using committed vendor/xscan/dist instead.');
    console.log('[sync-xscan] Installing runtime dependencies in vendor/xscan…');
    patchDemoScanDist(join(targetDist, 'index.mjs'));
    execSync('pnpm install --prod --ignore-workspace', {
      cwd: vendorRoot,
      env: { ...process.env, CI: 'true' },
      stdio: 'inherit',
    });
    console.log('[sync-xscan] Done');
    process.exit(0);
  }

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

patchDemoScanDist(join(targetDist, 'index.mjs'));

console.log(`[sync-xscan] Copied dist → ${targetDist}`);
console.log('[sync-xscan] Installing runtime dependencies in vendor/xscan…');

execSync('pnpm install --prod --ignore-workspace', {
  cwd: vendorRoot,
  env: { ...process.env, CI: 'true' },
  stdio: 'inherit',
});

console.log('[sync-xscan] Done');
