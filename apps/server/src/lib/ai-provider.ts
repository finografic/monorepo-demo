import type { LlmProviderId } from '@workspace/shared';
import OpenAI from 'openai';

export interface AiProvider {
  client: OpenAI;
  model: string;
  providerId: LlmProviderId;
}

export function getAiProvider(): AiProvider {
  const mode = process.env.LLM_MODE ?? 'local';

  if (mode === 'hosted') {
    const apiKey = process.env.OPENCODE_API_KEY;
    if (!apiKey) throw new Error('OPENCODE_API_KEY is required when LLM_MODE=hosted');

    return {
      client: new OpenAI({
        apiKey,
        baseURL: process.env.OPENCODE_BASE_URL ?? 'https://opencode.ai/zen/go/v1',
      }),
      model: process.env.OPENCODE_MODEL ?? 'glm-5.2',
      providerId: 'opencode-go',
    };
  }

  if (mode === 'local') {
    return {
      client: new OpenAI({
        // LM Studio accepts any non-empty string as the key
        apiKey: process.env.OPENAI_API_KEY ?? 'lm-studio',
        baseURL: process.env.OPENAI_BASE_URL ?? 'http://localhost:1234/v1',
      }),
      model: process.env.OPENAI_MODEL ?? 'google/gemma-4-26b-a4b-qat',
      providerId: 'lmstudio',
    };
  }

  throw new Error(`Unsupported LLM_MODE: "${mode}". Use "local" or "hosted".`);
}
