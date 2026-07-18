import type { StreamMode } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';

interface PromptSourceSelectorProps {
  mode: StreamMode;
  disabled?: boolean;
  onModeChange: (mode: StreamMode) => void;
}

const PROMPT_SOURCE_MODE_LABELS: Record<StreamMode, string> = {
  fixture: 'Mock Fixture',
  live: 'Live LLM API',
};

export { PROMPT_SOURCE_MODE_LABELS };

const MODE_DESCRIPTIONS: Record<StreamMode, string> = {
  fixture: 'Fixture mode — pre-recorded responses, no API cost',
  live: 'Live mode — calls the configured OpenAI-compatible server provider',
};

const STREAM_MODES: readonly StreamMode[] = ['live', 'fixture'];

export function PromptSourceSelector({ mode, disabled = false, onModeChange }: PromptSourceSelectorProps) {
  return (
    <div className={`flex h-full flex-col justify-between${disabled ? ' opacity-60' : ''}`}>
      <div>
        <p className="text-sm font-semibold tracking-wide text-primary mb-0">Prompt Source</p>
        <p className="text-xs leading-5 font-medium text-muted-foreground/75 mb-2">
          {MODE_DESCRIPTIONS[mode]}
        </p>
      </div>
      <div className="flex h-[40px] overflow-hidden rounded-md border border-muted-foreground bg-white text-sm font-medium">
        {STREAM_MODES.map((streamMode) => (
          <Button
            key={streamMode}
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => onModeChange(streamMode)}
            className={[
              'h-full min-h-0 flex-1 items-center justify-center rounded-none border-0 pt-0.75 text-sm font-medium transition-colors disabled:cursor-not-allowed',
              mode === streamMode
                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                : 'text-muted-foreground hover:bg-primary/33 hover:text-foreground',
            ].join(' ')}
          >
            {PROMPT_SOURCE_MODE_LABELS[streamMode]}
          </Button>
        ))}
      </div>
    </div>
  );
}
