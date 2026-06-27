import type { GenerationStatus } from '@workspace/shared';

interface StreamingControlsProps {
  status: GenerationStatus;
  hasSelection: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export function StreamingControls({
  status,
  hasSelection,
  onStart,
  onStop,
  onClear,
}: StreamingControlsProps) {
  const isStreaming = status === 'streaming';
  const hasContent = status !== 'idle';

  return (
    <div className="flex gap-2 mt-4">
      <button
        type="button"
        onClick={onStart}
        disabled={isStreaming || !hasSelection}
        aria-label="Generate response"
        className="flex-1 rounded-md bg-primary text-primary-foreground text-sm font-medium px-3 py-2 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isStreaming ? 'Generating…' : 'Generate'}
      </button>

      <button
        type="button"
        onClick={onStop}
        disabled={!isStreaming}
        aria-label="Stop generation"
        className="rounded-md border border-border text-sm px-3 py-2 text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Stop
      </button>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasContent}
        aria-label="Clear output"
        className="rounded-md border border-border text-sm px-3 py-2 text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Clear
      </button>
    </div>
  );
}
