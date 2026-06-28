import type { Prompt } from '@workspace/shared';
import { useRef } from 'react';

interface PromptSelectorProps {
  prompts: Prompt[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

const capabilityColours: Record<string, string> = {
  'Mermaid flowchart': 'bg-purple-800 text-purple-50 dark:bg-purple-200 dark:text-purple-950',
  'Mermaid sequence': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  'Markdown table': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  'Code block': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  'TypeScript': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  'REST API': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

export function PromptSelector({ prompts, selectedId, disabled, onSelect }: PromptSelectorProps) {
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
          return (
            <li
              key={prompt.id}
              role="option"
              aria-selected={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && onSelect(prompt.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                'rounded-lg border-2 p-4 cursor-pointer transition-all select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-accent',
                disabled ? 'opacity-50 cursor-default pointer-events-none' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <p className="text-base font-semibold leading-snug text-foreground">{prompt.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{prompt.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prompt.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${capabilityColours[cap] ?? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'}`}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
