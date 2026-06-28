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
      <aside className="md:w-80 lg:w-96 flex-none border-b md:border-b-0 md:border-r border-border flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h1 className="text-sm font-semibold text-foreground">AI Markdown Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Streaming markdown · Mermaid diagrams · Syntax highlighting
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
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
                    className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {parameter.label}
                  </label>
                  <select
                    id={`prompt-param-${parameter.id}`}
                    value={parameterValues[parameter.id] ?? parameter.defaultValue}
                    disabled={status === 'streaming'}
                    onChange={(event) => handleParameterChange(parameter.id, event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-2 py-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="px-4 py-3 border-t border-border">
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
          <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
            {mode === 'fixture'
              ? 'Fixture mode — pre-recorded responses, no API cost'
              : 'Live mode — calls the configured OpenAI-compatible server provider'}
          </p>
        </div>
      </aside>

      {/* Right panel — output */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable output area */}
        <div className="flex-1 overflow-y-auto px-6 py-5" aria-live="polite" aria-label="Generated content">
          <PartialMarkdownGuard buffer={buffer} showRaw={showRaw} />
        </div>

        {/* Bottom bar — toggle + metrics */}
        <div className="border-t border-border px-5 py-2.5 flex items-center gap-4 flex-wrap bg-background">
          <SourceToggle showRaw={showRaw} onToggle={() => setShowRaw((v) => !v)} />
          <div className="flex-1">
            <MetricsBar status={status} metrics={metrics} />
          </div>
        </div>
      </main>
    </div>
  );
}
