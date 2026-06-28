import type { StreamMode } from '@workspace/shared';
import { MetricsBar } from 'components/MetricsBar/MetricsBar';
import { PartialMarkdownGuard } from 'components/PartialMarkdownGuard/PartialMarkdownGuard';
import { PromptSelector } from 'components/PromptSelector/PromptSelector';
import { SourceToggle } from 'components/SourceToggle/SourceToggle';
import { StreamingControls } from 'components/StreamingControls/StreamingControls';
import { PROMPTS } from 'prompts/index';
import { useState } from 'react';

import { useStreamingGeneration } from 'lib/useStreamingGeneration';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [mode, setMode] = useState<StreamMode>('fixture');
  const { status, buffer, metrics, start, stop, clear } = useStreamingGeneration();

  const selectedPrompt = PROMPTS.find((p) => p.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId(id);
    if (status === 'streaming') stop();
    clear();
  }

  function handleStart() {
    if (!selectedPrompt) return;
    setShowRaw(false);
    start(selectedPrompt.id, mode, selectedPrompt.systemPrompt);
  }

  function handleModeChange(next: StreamMode) {
    if (status === 'streaming') stop();
    clear();
    setMode(next);
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
        </div>

        <div className="px-4 py-3 border-t border-border">
          <StreamingControls
            status={status}
            hasSelection={!!selectedId}
            mode={mode}
            onModeChange={handleModeChange}
            onStart={handleStart}
            onStop={stop}
            onClear={clear}
          />
          <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
            {mode === 'fixture'
              ? 'Fixture mode — pre-recorded responses, no API cost'
              : 'Live mode — calls local LM Studio via OpenAI-compatible API'}
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
