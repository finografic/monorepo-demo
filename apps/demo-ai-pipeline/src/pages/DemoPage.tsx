import { DEFAULT_LIVE_MODEL_ID, LIVE_MODEL_OPTIONS } from '@workspace/shared';
import type { StreamMode } from '@workspace/shared';
import { MetricsBar } from 'components/MetricsBar/MetricsBar';
import { PartialMarkdownGuard } from 'components/PartialMarkdownGuard/PartialMarkdownGuard';
import { PromptSelector } from 'components/PromptSelector/PromptSelector';
import { SourceToggle } from 'components/SourceToggle/SourceToggle';
import { StreamingControls } from 'components/StreamingControls/StreamingControls';
import { PROMPTS } from 'prompts/index';
import { useEffect, useMemo, useState } from 'react';

import { useStreamingGeneration } from 'lib/useStreamingGeneration';
import qldLogoUrl from '../qld.svg';

interface SourceReference {
  label: string;
  url: string;
  note: string;
}

const SOURCE_REFERENCES: Record<string, SourceReference> = {
  'service-finder-used-vehicle-transfer': {
    label: 'Transport customer service centres',
    url: 'https://www.data.qld.gov.au/dataset/transport-csc',
    note: 'Mock RAG context — verify transactional advice against official TMR services.',
  },
  'service-finder-fine-payment': {
    label: 'QLDTraffic GeoJSON API',
    url: 'https://www.data.qld.gov.au/dataset/131940-traffic-and-travel-information-geojson-api',
    note: 'Mock RAG context — traffic/open-data sources are not infringement determinations.',
  },
  'service-finder-change-address': {
    label: 'Registration call centre enquiries',
    url: 'https://www.data.qld.gov.au/dataset/registration-call-centre-enquiries-daily-for-last-month',
    note: 'Mock RAG context — source shapes are illustrative, not official TMR reporting.',
  },
};

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [mode, setMode] = useState<StreamMode>('fixture');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_LIVE_MODEL_ID);
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const { status, buffer, metrics, start, stop, clear, restore } = useStreamingGeneration();

  const selectedPrompt = PROMPTS.find((p) => p.id === selectedId) ?? null;
  const selectedPromptParameters = useMemo(() => selectedPrompt?.parameters ?? [], [selectedPrompt]);
  const selectedParameterOptions = selectedPromptParameters.map((parameter) => {
    const value = parameterValues[parameter.id] ?? parameter.defaultValue;
    return parameter.options.find((item) => item.value === value) ?? parameter.options[0] ?? null;
  });
  const selectedPromptParameterText = selectedPromptParameters
    .map((parameter, index) => {
      const option = selectedParameterOptions[index];
      return option ? `${parameter.label}: ${option.promptText}` : null;
    })
    .filter(Boolean)
    .join('\n');

  const selectedSystemPrompt = selectedPromptParameterText
    ? `${selectedPrompt?.systemPrompt}\n\n${selectedPromptParameterText}`
    : selectedPrompt?.systemPrompt;

  const cacheKey = useMemo(() => {
    if (!selectedPrompt) return null;

    const parameterKey = selectedPromptParameters
      .map((parameter) => `${parameter.id}:${parameterValues[parameter.id] ?? parameter.defaultValue}`)
      .join('|');
    const modelKey = mode === 'live' ? selectedModelId : 'fixture';

    return [mode, selectedPrompt.id, modelKey, parameterKey].filter(Boolean).join('::');
  }, [mode, parameterValues, selectedModelId, selectedPrompt, selectedPromptParameters]);

  const fixturePromptId =
    mode === 'fixture'
      ? (selectedParameterOptions.find((option) => option?.fixturePromptId)?.fixturePromptId ??
        selectedPrompt?.id)
      : selectedPrompt?.id;
  const sourceReference =
    selectedPrompt?.id === 'service-finder'
      ? SOURCE_REFERENCES[selectedParameterOptions.find((option) => option?.fixturePromptId)?.fixturePromptId ?? '']
      : undefined;
  const isWaitingForFirstPaint = status === 'streaming' && buffer.length === 0;

  useEffect(() => {
    if (cacheKey && status !== 'streaming') restore(cacheKey);
  }, [cacheKey, restore, status]);

  function handleSelect(id: string) {
    if (status === 'streaming') stop();
    setSelectedId(id);
  }

  function handleStart() {
    if (!selectedPrompt || !selectedSystemPrompt || !cacheKey || !fixturePromptId) return;
    setShowRaw(false);
    start(cacheKey, fixturePromptId, mode, selectedSystemPrompt, selectedModelId);
  }

  function handleModeChange(next: StreamMode) {
    if (status === 'streaming') stop();
    setMode(next);
  }

  function handleClear() {
    clear(cacheKey ?? undefined);
  }

  function handleParameterChange(parameterId: string, value: string) {
    if (status === 'streaming') stop();
    setParameterValues((current) => ({ ...current, [parameterId]: value }));
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {/* Left panel — prompt selection */}
      <aside className="flex-none overflow-hidden border-b border-border md:w-[30rem] md:border-b-0 md:border-r lg:w-[32rem] flex flex-col">
        <div className="border-b border-border px-5 py-5">
          <h1 className="text-base font-semibold text-foreground">AI Markdown Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Streaming markdown · Mermaid diagrams · Syntax highlighting
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <PromptSelector
            prompts={PROMPTS}
            selectedId={selectedId}
            parameterValues={parameterValues}
            disabled={status === 'streaming'}
            onSelect={handleSelect}
            onParameterChange={handleParameterChange}
          />
        </div>

        <div className="min-h-24 border-t border-border px-4 py-4">
          <StreamingControls
            status={status}
            hasSelection={!!selectedId}
            mode={mode}
            liveModels={LIVE_MODEL_OPTIONS}
            selectedModelId={selectedModelId}
            onModeChange={handleModeChange}
            onModelChange={setSelectedModelId}
            onStart={handleStart}
            onStop={stop}
            onClear={handleClear}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground/70">
            {mode === 'fixture'
              ? 'Fixture mode — pre-recorded responses, no API cost'
              : 'Live mode — calls the configured OpenAI-compatible server provider'}
          </p>
        </div>
      </aside>

      {/* Right panel — output */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable output area */}
        <div
          className="flex-1 overflow-y-auto px-8 py-6"
          aria-live="polite"
          aria-label="Generated content"
        >
          {isWaitingForFirstPaint ? (
            <GeneratingPlaceholder />
          ) : buffer.length ? (
            <PartialMarkdownGuard buffer={buffer} showRaw={showRaw} />
          ) : (
            <StandbyPlaceholder />
          )}
        </div>

        {/* Bottom bar — toggle + metrics */}
        <div className="flex min-h-24 flex-wrap items-center gap-5 border-t border-border bg-background px-8 py-4">
          <SourceToggle showRaw={showRaw} onToggle={() => setShowRaw((v) => !v)} />
          <div className="flex-1">
            <MetricsBar status={status} metrics={metrics} />
          </div>
          {sourceReference ? <SourceAttribution source={sourceReference} /> : null}
        </div>
      </main>
    </div>
  );
}

function SourceAttribution({ source }: { source: SourceReference }) {
  return (
    <div className="basis-full text-xs text-muted-foreground">
      <span className="font-medium">Source:</span>{' '}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {source.label}
      </a>
      <span className="mx-2 text-muted-foreground/40" aria-hidden="true">
        ·
      </span>
      <span className="text-muted-foreground/70">{source.note}</span>
    </div>
  );
}

function StandbyPlaceholder() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center">
        <img src={qldLogoUrl} alt="Queensland Government" className="w-72 max-w-[70vw]" />
        <p className="text-base font-medium text-primary">Select a prompt and click Generate to begin.</p>
      </div>
    </div>
  );
}

function GeneratingPlaceholder() {
  return (
    <div className="flex min-h-full items-center justify-center" role="status" aria-live="polite">
      <span className="h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary/70" />
      <span className="sr-only">Generating response</span>
    </div>
  );
}
