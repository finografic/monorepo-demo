import type { StreamMode } from '@workspace/shared';

interface PromptSourceSelectorProps {
  mode: StreamMode;
  disabled?: boolean;
  onModeChange: (mode: StreamMode) => void;
}

const MODE_LABELS: Record<StreamMode, string> = {
  fixture: 'Mock Fixture',
  live: 'Live LLM API',
};

const MODE_DESCRIPTIONS: Record<StreamMode, string> = {
  fixture: 'Fixture mode — pre-recorded responses, no API cost',
  live: 'Live mode — calls the configured OpenAI-compatible server provider',
};

const STREAM_MODES: readonly StreamMode[] = ['live', 'fixture'];

export function PromptSourceSelector({ mode, disabled = false, onModeChange }: PromptSourceSelectorProps) {
  return (
    <div className={disabled ? 'opacity-60 space-y-1.5' : 'space-y-1.5'}>
      <p className="text-sm font-semibold tracking-wide text-primary">Prompt Source</p>
      <div className="flex overflow-hidden rounded-md border border-border text-sm font-medium">
        {STREAM_MODES.map((streamMode) => (
          <button
            key={streamMode}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(streamMode)}
            className={[
              'flex-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
              mode === streamMode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            ].join(' ')}
          >
            {MODE_LABELS[streamMode]}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 font-medium text-muted-foreground/75 pt-2">{MODE_DESCRIPTIONS[mode]}</p>
    </div>
  );
}
