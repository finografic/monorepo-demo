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
  const secondaryActionClass =
    'rounded-md border-2 border-amber-500 px-4 py-3 text-base font-semibold text-amber-500 transition-colors hover:bg-amber-200 hover:border-amber-600 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:border-muted-foreground disabled:bg-transparent disabled:text-muted-foreground disabled:opacity-30';

  const modeLabels: Record<StreamMode, string> = {
    fixture: 'Fixture',
    live: 'Live LLM API',
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div>
        <p className="mb-1 text-xs font-semibold tracking-wide text-primary">Prompt Source</p>
        <div className="flex overflow-hidden rounded-md border border-border text-sm font-medium">
          {(['live', 'fixture'] as StreamMode[]).map((m) => (
            <button
              key={m}
              type="button"
              disabled={isStreaming}
              onClick={() => onModeChange(m)}
              className={[
                'flex-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              ].join(' ')}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      <ModelSelector
        models={liveModels}
        selectedModelId={selectedModelId}
        disabled={isStreaming || mode !== 'live'}
        onModelChange={onModelChange}
      />

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onStart}
          disabled={isStreaming || !hasSelection}
          aria-label="Generate response"
          className="flex-1 rounded-md bg-green-600 px-4 py-3 mr-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isStreaming ? 'Generating…' : 'Generate'}
        </button>

        <button
          type="button"
          onClick={onStop}
          disabled={!isStreaming}
          aria-label="Stop generation"
          className={secondaryActionClass}
        >
          Stop
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasContent}
          aria-label="Clear output"
          className={secondaryActionClass}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
