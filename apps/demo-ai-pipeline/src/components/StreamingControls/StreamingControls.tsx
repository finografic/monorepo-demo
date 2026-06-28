import type { GenerationStatus, ModelOption, StreamMode } from '@workspace/shared';
import { ModelSelector } from 'components/ModelSelector/ModelSelector';

interface StreamingControlsProps {
  status: GenerationStatus;
  hasSelection: boolean;
  mode: StreamMode;
  liveModels: readonly ModelOption[];
  selectedModelId: string;
  onModeChange: (mode: StreamMode) => void;
  onModelChange: (modelId: string) => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export function StreamingControls({
  status,
  hasSelection,
  mode,
  liveModels,
  selectedModelId,
  onModeChange,
  onModelChange,
  onStart,
  onStop,
  onClear,
}: StreamingControlsProps) {
  const isStreaming = status === 'streaming';
  const hasContent = status !== 'idle';

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
        {(['fixture', 'live'] as StreamMode[]).map((m) => (
          <button
            key={m}
            type="button"
            disabled={isStreaming}
            onClick={() => onModeChange(m)}
            className={[
              'flex-1 py-1.5 transition-colors capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
              mode === m
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            ].join(' ')}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'live' ? (
        <ModelSelector
          models={liveModels}
          selectedModelId={selectedModelId}
          disabled={isStreaming}
          onModelChange={onModelChange}
        />
      ) : null}

      {/* Action buttons */}
      <div className="flex gap-2">
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
    </div>
  );
}
