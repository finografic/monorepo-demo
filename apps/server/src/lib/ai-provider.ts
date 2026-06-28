import OpenAI from 'openai';

export interface AiProvider {
  client: OpenAI;
  model: string;
}

// TODO: OpenCode provider
// OPENCODE_BASE_URL and OPENCODE_MODEL are not yet confirmed by the vendor.
// When available, wire in:
//   new OpenAI({ baseURL: process.env.OPENCODE_BASE_URL, apiKey: process.env.OPENCODE_API_KEY })
// and select via a STREAM_PROVIDER=opencode env var.

export function getAiProvider(): AiProvider {
  // LM Studio and many OpenAI-compatible servers accept any non-empty string as the key.
  const apiKey = process.env.OPENAI_API_KEY ?? 'lm-studio';
  const baseURL = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  return {
    client: new OpenAI({ apiKey, baseURL }),
    model,
  };
}
