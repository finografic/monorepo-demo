import type { ModelOption } from '@workspace/shared';
import { NativeSelect, NativeSelectOption } from '@workspace/ui/components/native-select';

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
    <div className={disabled ? 'opacity-60 space-y-1.5' : 'space-y-1.5'}>
      <label htmlFor="live-model" className="text-sm font-medium tracking-wider text-primary">
        Live LLM model
      </label>
      <NativeSelect
        id="live-model"
        value={selectedModelId}
        disabled={disabled}
        onChange={(event) => onModelChange(event.target.value)}
        className="w-full"
      >
        {models.map((model) => (
          <NativeSelectOption key={model.id} value={model.id}>
            {model.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {selectedModel ? (
        <p className="text-xs leading-5 font-medium text-muted-foreground/75 pt-2">
          {selectedModel.description}
          {selectedModel.isReasoning ? ' Reasoning model: may take longer to begin streaming.' : ''}
        </p>
      ) : null}
    </div>
  );
}
