import type { GenerationStatus } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';

interface StreamingControlsProps {
  status: GenerationStatus;
  hasSelection: boolean;
  selectedPromptSourceContext?: string | undefined;
  selectedPromptTitle?: string | undefined;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
}

export function StreamingControls({
  status,
  hasSelection,
  selectedPromptSourceContext,
  selectedPromptTitle,
  onStart,
  onStop,
  onClear,
}: StreamingControlsProps) {
  const isStreaming = status === 'streaming';
  const hasContent = status !== 'idle';
  const showGenerateStop = status === 'idle' || status === 'streaming';
  const actionButtonClass =
    'h-[40px] items-center justify-center rounded-md px-4 pt-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed';
  const secondaryActionClass = `${actionButtonClass} pt-0.75 border border-amber-500 text-amber-500 hover:bg-amber-200 hover:border-amber-600 hover:text-amber-600 disabled:border-muted-foreground disabled:bg-white disabled:text-muted-foreground`;

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold tracking-wide text-primary mb-0">
          {selectedPromptTitle ?? 'Choose a prompt'}
        </p>
        <p className="text-xs leading-5 font-medium text-muted-foreground/75 mb-2">
          {selectedPromptSourceContext
            ? `Source intent: ${selectedPromptSourceContext}`
            : 'Select a scenario, then generate markdown from fixture or live LLM mode.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch gap-2">
        {showGenerateStop ? (
          <>
            <Button
              type="button"
              onClick={onStart}
              disabled={isStreaming || !hasSelection}
              aria-label="Generate response"
              className={`${actionButtonClass} pt-0.75 mr-4 flex-1 border border-green-600 bg-green-600 text-primary-foreground hover:bg-green-600 hover:opacity-90 disabled:border-muted-foreground disabled:bg-white disabled:text-muted-foreground`}
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
          </>
        ) : null}

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={!hasContent}
          aria-label="Clear output"
          className={`${secondaryActionClass} ${showGenerateStop ? '' : 'flex-1'}`}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
