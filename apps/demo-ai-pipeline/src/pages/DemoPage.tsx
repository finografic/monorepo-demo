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
            disabled={status === 'streaming'}
            onSelect={handleSelect}
          />

          {selectedPromptParameters.length ? (
            <div className="mt-4 space-y-3">
              {selectedPromptParameters.map((parameter) => (
                <div key={parameter.id} className="space-y-1.5">
                  <label
                    htmlFor={`prompt-param-${parameter.id}`}
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {parameter.label}
                  </label>
                  <select
                    id={`prompt-param-${parameter.id}`}
                    value={parameterValues[parameter.id] ?? parameter.defaultValue}
                    disabled={status === 'streaming'}
                    onChange={(event) => handleParameterChange(parameter.id, event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {parameter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : null}
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
        </div>
      </main>
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
