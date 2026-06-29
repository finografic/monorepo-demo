import type { LlmProviderId } from './types';

export type ModelTag = 'default' | 'budget' | 'fast' | 'reasoning' | 'balanced' | 'markdown';

export interface ModelOption {
  id: string;
  label: string;
  provider: LlmProviderId;
  description: string;
  isReasoning: boolean;
  tags: ModelTag[];
  inputCostUsdPerMillion: number;
  outputCostUsdPerMillion: number;
}

export const LIVE_MODEL_OPTIONS = [
  {
    id: 'qwen3.7-plus',
    label: 'Qwen 3.7 Plus',
    provider: 'opencode-go',
    description: 'Balanced hosted default for markdown, Mermaid, tables, and JSON examples.',
    isReasoning: false,
    tags: ['default', 'balanced', 'markdown'],
    inputCostUsdPerMillion: 0.4,
    outputCostUsdPerMillion: 1.6,
  },
  {
    id: 'mimo-v2.5',
    label: 'MiMo v2.5',
    provider: 'opencode-go',
    description: 'Budget hosted option for lower-cost live demos when output quality is acceptable.',
    isReasoning: false,
    tags: ['budget', 'fast'],
    inputCostUsdPerMillion: 0.14,
    outputCostUsdPerMillion: 0.28,
  },
  {
    id: 'glm-5.2',
    label: 'GLM 5.2',
    provider: 'opencode-go',
    description: 'Premium reasoning option for complex prompts; higher cost and longer TTFT.',
    isReasoning: true,
    tags: ['reasoning', 'balanced'],
    inputCostUsdPerMillion: 1.4,
    outputCostUsdPerMillion: 4.4,
  },
] as const satisfies readonly ModelOption[];

export const DEFAULT_LIVE_MODEL_ID = 'qwen3.7-plus';

export const LIVE_MODEL_IDS: readonly string[] = LIVE_MODEL_OPTIONS.map((model) => model.id);

export function findLiveModel(modelId: string): ModelOption | undefined {
  return LIVE_MODEL_OPTIONS.find((model) => model.id === modelId);
}

export function isLiveModelId(modelId: string): boolean {
  return LIVE_MODEL_IDS.includes(modelId);
}
