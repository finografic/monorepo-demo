export type StreamMode = 'fixture' | 'live';

export type LlmProviderId = 'fixture' | 'lmstudio' | 'opencode-go';

export type GenerationStatus = 'idle' | 'streaming' | 'complete' | 'error';

export interface StreamChunk {
  type: 'delta' | 'done' | 'error';
  text?: string;
  metrics?: MetricsData;
  message?: string;
}

export interface MetricsData {
  tokens: number;
  timeToFirstToken: number;
  totalTime: number;
  model: string;
  mode: StreamMode;
  provider: LlmProviderId;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  estimatedCostUsd?: number;
  isReasoning?: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  capabilities: CapabilityTag[];
  systemPrompt: string;
  parameters?: PromptParameter[];
}

export interface PromptParameter {
  id: string;
  label: string;
  defaultValue: string;
  options: PromptParameterOption[];
}

export interface PromptParameterOption {
  value: string;
  label: string;
  promptText: string;
  fixturePromptId?: string;
}

export type CapabilityTag =
  | 'Mermaid flowchart'
  | 'Mermaid sequence'
  | 'Markdown table'
  | 'Code block'
  | 'TypeScript'
  | 'REST API'
  | 'Decision table'
  | 'OIDC/Auth'
  | 'Payment flow'
  | 'Status model'
  | 'WCAG notes'
  | 'Secure data'
  | 'Audit trail'
  | 'Payment states'
  | 'Error JSON'
  | 'AI/RAG'
  | 'Knowledge graph'
  | 'Human review';

export interface PromptFixture {
  promptId: string;
  model: string;
  content: string;
  metrics: Omit<MetricsData, 'mode'>;
}
