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
    <div className={`flex h-full flex-col justify-between${disabled ? ' opacity-60' : ''}`}>
      <div>
        <label htmlFor="live-model" className="block text-sm font-semibold tracking-wide text-primary">
          Live LLM model
        </label>
        {selectedModel ? (
          <p className="text-xs leading-5 font-medium text-muted-foreground/75 mb-2">
            {selectedModel.description}
            {selectedModel.isReasoning ? ' Reasoning model: may take longer to begin streaming.' : ''}
          </p>
        ) : null}
      </div>
      <NativeSelect
        id="live-model"
        value={selectedModelId}
        disabled={disabled}
        onChange={(event) => onModelChange(event.target.value)}
        className="w-full rounded-lg bg-white [&_select]:h-[40px] [&_select]:border-muted-foreground [&_select]:py-0 [&_select]:leading-[40px] [&_select]:font-medium"
      >
        {models.map((model) => (
          <NativeSelectOption key={model.id} value={model.id}>
            {model.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
