import type { Prompt } from '@workspace/shared';
import { useRef } from 'react';

interface PromptSelectorProps {
  prompts: Prompt[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

const capabilityColours: Record<string, string> = {
  'Mermaid flowchart': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Mermaid sequence': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Markdown table': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Code block': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'TypeScript': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'REST API': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Choose a prompt
      </h2>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Curated prompts"
        aria-orientation="vertical"
        className="space-y-2"
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
                'rounded-lg border p-3 cursor-pointer transition-all select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-accent',
                disabled ? 'opacity-50 cursor-default pointer-events-none' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <p className="text-sm font-medium text-foreground leading-snug">{prompt.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{prompt.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {prompt.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${capabilityColours[cap] ?? 'bg-muted text-muted-foreground'}`}
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
