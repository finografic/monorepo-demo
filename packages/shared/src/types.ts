export type StreamMode = 'fixture' | 'live';

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
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  capabilities: CapabilityTag[];
  systemPrompt: string;
}

export type CapabilityTag =
  | 'Mermaid flowchart'
  | 'Mermaid sequence'
  | 'Markdown table'
  | 'Code block'
  | 'TypeScript'
  | 'REST API';

export interface PromptFixture {
  promptId: string;
  model: string;
  content: string;
  metrics: Omit<MetricsData, 'mode'>;
}
