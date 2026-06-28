import type { ModelOption } from '@workspace/shared';

interface ModelSelectorProps {
  models: readonly ModelOption[];
  selectedModelId: string;
  disabled?: boolean;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({
  models,
  selectedModelId,
  disabled = false,
  onModelChange,
}: ModelSelectorProps) {
  const selectedModel = models.find((model) => model.id === selectedModelId);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="live-model"
        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        Live model
      </label>
      <select
        id="live-model"
        value={selectedModelId}
        disabled={disabled}
        onChange={(event) => onModelChange(event.target.value)}
        className="w-full rounded-md border border-border bg-background px-2 py-2 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>
      {selectedModel ? (
        <p className="text-[10px] leading-snug text-muted-foreground/70">
          {selectedModel.description}
          {selectedModel.isReasoning ? ' Reasoning model: may take longer to begin streaming.' : ''}
        </p>
      ) : null}
    </div>
  );
}
