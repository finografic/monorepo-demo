import { OptionCard } from '@workspace/shared';
import type { Prompt } from '@workspace/shared';
import { useRef } from 'react';

interface PromptSelectorProps {
  prompts: Prompt[];
  selectedId: string | null;
  parameterValues: Record<string, string>;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onParameterChange: (parameterId: string, value: string) => void;
}

const capabilityColours: Record<string, string> = {
  'Mermaid flowchart': 'bg-purple-200 text-purple-800 dark:bg-purple-200 dark:text-purple-950',
  'Mermaid sequence': 'bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  'Markdown table': 'bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  'Code block': 'bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  'TypeScript': 'bg-sky-200 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  'REST API': 'bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
};

export function PromptSelector({
  prompts,
  selectedId,
  parameterValues,
  disabled,
  onSelect,
  onParameterChange,
}: PromptSelectorProps) {
  const listRef = useRef<HTMLUListElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
    if (!items) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (currentIndex + 1) % items.length;
      items[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (currentIndex - 1 + items.length) % items.length;
      items[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onSelect(prompts[currentIndex]!.id);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Choose a prompt
      </h2>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Curated prompts"
        aria-orientation="vertical"
        className="space-y-3"
      >
        {prompts.map((prompt, index) => {
          const isSelected = prompt.id === selectedId;
          const badges = prompt.capabilities.map((cap) => ({
            label: cap,
            className:
              capabilityColours[cap] ?? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
          }));

          return (
            <OptionCard
              key={prompt.id}
              title={prompt.title}
              description={prompt.description}
              badges={badges}
              selected={isSelected}
              disabled={!!disabled}
              onSelect={() => onSelect(prompt.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {isSelected && prompt.parameters?.length ? (
                <div className="mt-4 space-y-3 border-t border-border/80 pt-4">
                  {prompt.parameters.map((parameter) => (
                    <div key={parameter.id} className="space-y-1.5">
                      <label
                        htmlFor={`prompt-param-${parameter.id}`}
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {parameter.label}
                      </label>
                      <select
                        id={`prompt-param-${parameter.id}`}
                        value={parameterValues[parameter.id] ?? parameter.defaultValue}
                        disabled={disabled}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        onChange={(event) => onParameterChange(parameter.id, event.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {parameter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : null}
            </OptionCard>
          );
        })}
      </ul>
    </div>
  );
}
