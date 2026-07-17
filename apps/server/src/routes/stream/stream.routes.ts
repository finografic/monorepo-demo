import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { paths } from '@workspace/config/paths';
import { DEFAULT_LIVE_MODEL_ID, findLiveModel, isLiveModelId } from '@workspace/shared';
import type { MetricsData, PromptFixture, StreamChunk } from '@workspace/shared';
import { stream } from 'hono/streaming';
import { rateLimit } from 'middlewares/rate-limit';
import * as v from 'valibot';

import { getAiProvider } from 'lib/ai-provider';
import { createRouter } from 'lib/create-app';
import { requireAuth } from 'lib/require-auth';

const FIXTURES_DIR = resolve(paths.root, 'apps/demo-ai-pipeline/src/fixtures');

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
  return new Promise((res) => setTimeout(res, ms));
}

const LiveBodySchema = v.object({
  promptId: v.string(),
  systemPrompt: v.pipe(v.string(), v.minLength(1)),
  modelId: v.optional(v.string()),
});

const LIVE_MAX_TOKENS = 2400;

function getStringDelta(delta: unknown, key: 'content' | 'reasoning_content'): string {
  if (!delta || typeof delta !== 'object') return '';
  const value = (delta as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function estimateCostUsd(inputTokens: number, outputTokens: number, modelId: string): number | undefined {
  const model = findLiveModel(modelId);
  if (!model) return undefined;

  const inputCost = (inputTokens / 1_000_000) * model.inputCostUsdPerMillion;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostUsdPerMillion;
  const total = inputCost + outputCost;

  return Number(total.toFixed(6));
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

        const payload = JSON.stringify({ type: 'delta', text: chunk } satisfies StreamChunk);
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
          provider: 'fixture',
        },
      } satisfies StreamChunk);
      await s.write(`data: ${donePayload}\n\n`);
    });
  })
  .post('/live', requireAuth(), rateLimit({ limit: 10, windowMs: 60 * 60 * 1000 }), async (c) => {
    const body = v.safeParse(LiveBodySchema, await c.req.json());
    if (!body.success) {
      return c.json({ error: 'BAD_REQUEST', message: 'promptId and systemPrompt are required' }, 400);
    }

    const requestedModelId = body.output.modelId ?? process.env.OPENCODE_MODEL ?? DEFAULT_LIVE_MODEL_ID;
    if (!isLiveModelId(requestedModelId)) {
      return c.json(
        {
          error: 'UNSUPPORTED_MODEL',
          message: `Model is not allowed for this demo: ${requestedModelId}`,
        },
        400,
      );
    }

    const { promptId: _promptId, systemPrompt } = body.output;
    const { client, model, providerId } = getAiProvider({ modelId: requestedModelId });
    const modelInfo = findLiveModel(model);

    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    c.header('X-Accel-Buffering', 'no');

    const startMs = Date.now();
    let firstChunkMs = 0;
    let firstChunkSent = false;
    let tokenCount = 0;
    let reasoningTokenCount = 0;
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    let estimatedCostUsd: number | undefined;

    return stream(c, async (s) => {
      try {
        await s.write(': connected\n\n');

        const aiStream = await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: systemPrompt }],
          max_tokens: LIVE_MAX_TOKENS,
          stream: true,
          stream_options: { include_usage: true },
        });

        for await (const chunk of aiStream) {
          const delta = chunk.choices[0]?.delta;
          const text = getStringDelta(delta, 'content');
          const reasoningText = getStringDelta(delta, 'reasoning_content');

          if (reasoningText) {
            reasoningTokenCount += Math.ceil(reasoningText.length / 4);
          }

          const { usage } = chunk as unknown as { usage?: Record<string, unknown> };
          if (usage) {
            inputTokens = getNumber(usage.prompt_tokens) ?? inputTokens;
            outputTokens = getNumber(usage.completion_tokens) ?? outputTokens;
            reasoningTokenCount =
              getNumber(usage.reasoning_tokens) ??
              getNumber(
                (usage.completion_tokens_details as Record<string, unknown> | undefined)?.reasoning_tokens,
              ) ??
              reasoningTokenCount;
            estimatedCostUsd = getNumber(usage.estimated_cost) ?? estimatedCostUsd;
          }

          if (!text) continue;

          if (!firstChunkSent) {
            firstChunkMs = Date.now() - startMs;
            firstChunkSent = true;
          }
          tokenCount += Math.ceil(text.length / 4);

          const payload = JSON.stringify({ type: 'delta', text } satisfies StreamChunk);
          await s.write(`data: ${payload}\n\n`);
        }

        const finalEstimatedCostUsd =
          estimatedCostUsd ??
          estimateCostUsd(
            inputTokens ?? Math.ceil(systemPrompt.length / 4),
            outputTokens ?? tokenCount,
            model,
          );
        const metrics = {
          tokens: tokenCount,
          timeToFirstToken: firstChunkMs,
          totalTime: Date.now() - startMs,
          model,
          mode: 'live',
          provider: providerId,
          ...(inputTokens !== undefined ? { inputTokens } : {}),
          ...(outputTokens !== undefined ? { outputTokens } : {}),
          ...(reasoningTokenCount ? { reasoningTokens: reasoningTokenCount } : {}),
          ...(finalEstimatedCostUsd !== undefined ? { estimatedCostUsd: finalEstimatedCostUsd } : {}),
          ...(modelInfo ? { isReasoning: modelInfo.isReasoning } : {}),
        } satisfies MetricsData;

        const donePayload = JSON.stringify({
          type: 'done',
          metrics,
        } satisfies StreamChunk & { metrics: MetricsData });
        await s.write(`data: ${donePayload}\n\n`);
      } catch (err) {
        const errPayload = JSON.stringify({
          type: 'error',
          message: err instanceof Error ? err.message : 'Live generation failed',
        } satisfies StreamChunk);
        await s.write(`data: ${errPayload}\n\n`);
      }
    });
  });

export { streamRouter };
