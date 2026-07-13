import type { GenerationStatus, ModelOption, StreamMode } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';
import { ModelSelector } from 'components/ModelSelector/ModelSelector';
import { PromptSourceSelector } from 'components/PromptSourceSelector/PromptSourceSelector';

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
  const actionButtonClass =
    'h-auto rounded-md px-4 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30';
  const secondaryActionClass = `${actionButtonClass} border-2 border-amber-500 text-amber-500 hover:bg-amber-200 hover:border-amber-600 hover:text-amber-600 disabled:border-muted-foreground disabled:bg-transparent disabled:text-muted-foreground`;

  return (
    <div className="space-y-3">
      <PromptSourceSelector mode={mode} disabled={isStreaming} onModeChange={onModeChange} />

      <ModelSelector
        models={liveModels}
        selectedModelId={selectedModelId}
        disabled={isStreaming || mode !== 'live'}
        onModelChange={onModelChange}
      />

      {/* Action buttons */}
      <div className="flex items-stretch gap-2 pt-2">
        <Button
          type="button"
          onClick={onStart}
          disabled={isStreaming || !hasSelection}
          aria-label="Generate response"
          className={`${actionButtonClass} mr-4 flex-1 bg-green-600 text-primary-foreground hover:bg-green-600 hover:opacity-90`}
        >
          {isStreaming ? 'Generating…' : 'Generate Markdown'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onStop}
          disabled={!isStreaming}
          aria-label="Stop generation"
          className={secondaryActionClass}
        >
          Stop
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={!hasContent}
          aria-label="Clear output"
          className={secondaryActionClass}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
