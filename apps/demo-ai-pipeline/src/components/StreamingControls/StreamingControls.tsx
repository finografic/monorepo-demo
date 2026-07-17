import type { GenerationStatus } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';

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
  const actionButtonClass =
    'h-[40px] rounded-md px-4 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed';
  const secondaryActionClass = `${actionButtonClass} border-2 border-amber-500 text-amber-500 hover:bg-amber-200 hover:border-amber-600 hover:text-amber-600 disabled:border-muted-foreground disabled:bg-white disabled:text-muted-foreground`;

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold tracking-wide text-primary mb-0">Foo Bar</p>
        <p className="text-xs leading-5 font-medium text-muted-foreground/75 mb-2">Lorem ipsum..</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch gap-2 pt-2">
        <Button
          type="button"
          onClick={onStart}
          disabled={isStreaming || !hasSelection}
          aria-label="Generate response"
          className={`${actionButtonClass} mr-4 flex-1 border-2 border-green-600 bg-green-600 text-primary-foreground hover:bg-green-600 hover:opacity-90 disabled:border-muted-foreground disabled:bg-white disabled:text-muted-foreground`}
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
