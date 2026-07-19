const PRINT_PARAM = 'print';

const DEFAULT_AWS_FRONTEND_ORIGIN = 'https://d2h3ihm2ddi3lx.cloudfront.net';

/** True when `?print` is present (any value, including empty). */
export function isPrintSearch(search: string): boolean {
  return new URLSearchParams(search).has(PRINT_PARAM);
}

/** True on `/print` path (basename-aware via React Router location.pathname). */
export function isPrintPath(pathname: string): boolean {
  return pathname === '/print' || pathname.endsWith('/print');
}

export function isPrintMode(pathname: string, search: string): boolean {
  return isPrintPath(pathname) || isPrintSearch(search);
}

/** AWS CloudFront origin for portfolio demos in print/PDF mode (`VITE_AWS_FRONTEND_URL`). */
export function awsFrontendOrigin(): string {
  const configured = import.meta.env.VITE_AWS_FRONTEND_URL?.replace(/\/+$/, '');
  return configured || DEFAULT_AWS_FRONTEND_ORIGIN;
}

export function awsDemoUrl(demoPath: string): string {
  const path = demoPath.replace(/^\/+|\/+$/g, '');
  return `${awsFrontendOrigin()}/${path}/`;
}

/** Default Save-as-PDF filename stem (browser adds `.pdf`). */
export const PRINT_DOCUMENT_TITLE = 'monorepo-demo_Justin-Blair-Rankin';

/** Anchor attrs for external links saved to PDF (`?print` / `/print`). */
export const PRINT_EXTERNAL_LINK = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;
