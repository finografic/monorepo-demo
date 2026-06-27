import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PromptFixture } from '@workspace/shared';
import { stream } from 'hono/streaming';
import { rateLimit } from 'middlewares/rate-limit';

import { createRouter } from 'lib/create-app';

const FIXTURES_DIR = resolve(import.meta.dirname, '../../../../demo-ai-pipeline/src/fixtures');

function loadFixture(promptId: string): PromptFixture | null {
  try {
    const raw = readFileSync(resolve(FIXTURES_DIR, `${promptId}.fixture.json`), 'utf8');
    return JSON.parse(raw) as PromptFixture;
  } catch {
    return null;
  }
}

function splitIntoChunks(text: string, avgSize = 12): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const size = avgSize + Math.floor(Math.random() * 8) - 3;
    const end = Math.min(i + Math.max(1, size), text.length);
    const boundary = text.lastIndexOf(' ', end);
    const actualEnd = boundary > i ? boundary + 1 : end;
    chunks.push(text.slice(i, actualEnd));
    i = actualEnd;
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const streamRouter = createRouter()
  .get('/fixture/:promptId', async (c) => {
    const promptId = c.req.param('promptId');
    const fixture = loadFixture(promptId);

    if (!fixture) {
      return c.json({ error: 'NOT_FOUND', message: `No fixture for prompt: ${promptId}` }, 404);
    }

    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    c.header('X-Accel-Buffering', 'no');

    const startMs = Date.now();
    let firstChunkSent = false;

    return stream(c, async (s) => {
      const chunks = splitIntoChunks(fixture.content);

      for (const chunk of chunks) {
        const delayMs = firstChunkSent
          ? 30 + Math.floor(Math.random() * 25)
          : 280 + Math.floor(Math.random() * 60);
        await sleep(delayMs);

        const payload = JSON.stringify({ type: 'delta', text: chunk });
        await s.write(`data: ${payload}\n\n`);

        firstChunkSent = true;
      }

      const totalTime = Date.now() - startMs;
      const donePayload = JSON.stringify({
        type: 'done',
        metrics: {
          ...fixture.metrics,
          totalTime,
          mode: 'fixture',
        },
      });
      await s.write(`data: ${donePayload}\n\n`);
    });
  })
  .post('/live', rateLimit({ limit: 10, windowMs: 60 * 60 * 1000 }), async (c) => {
    return c.json(
      {
        error: 'NOT_IMPLEMENTED',
        message:
          'Live mode is not enabled in this deployment. Set STREAM_MODE=live with a valid ANTHROPIC_API_KEY to enable it.',
      },
      501,
    );
  });

export { streamRouter };
