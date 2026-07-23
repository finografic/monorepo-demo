import { env } from 'env.server';

import type { AppContext } from 'types/app.types';

const MOUNT_PREFIX = '/api/xscan';

// Headers that must not be copied straight through from the upstream fetch()
// response — undici already decodes/reframes these, so re-sending the
// original values causes mismatched-length or double-encoding errors.
const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
]);

async function proxyToXscanApi(c: AppContext): Promise<Response> {
  const incoming = new URL(c.req.url);
  const targetPath = incoming.pathname.slice(MOUNT_PREFIX.length) || '/';
  const targetUrl = new URL(`${targetPath}${incoming.search}`, env.XSCAN_API_URL);

  const upstream = await fetch(targetUrl, {
    method: c.req.method,
    headers: { accept: c.req.header('accept') ?? '*/*' },
  });

  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return new Response(upstream.body, { status: upstream.status, headers });
}

export const xscan = {
  path: '/*' as const,
  handler: proxyToXscanApi,
};
