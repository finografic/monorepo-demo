import { useCallback, useRef } from 'react';
import type { ChartMeta } from 'data/types';

interface ChartSelectorProps {
  charts: ChartMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChartSelector({ charts, selectedId, onSelect }: ChartSelectorProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
      const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
      if (!items) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[Math.min(index + 1, items.length - 1)]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[Math.max(index - 1, 0)]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(charts[index]!.id);
      }
    },
    [charts, onSelect],
  );

  const isLive = (id: string) => id === 'live-catalogue';

  return (
    <nav aria-label="Available charts">
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Chart selection"
        aria-orientation="vertical"
        className="space-y-2"
      >
        {charts.map((chart, index) => {
          const selected = chart.id === selectedId;
          return (
            <li
              key={chart.id}
              role="option"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(chart.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                'cursor-pointer rounded-xl border p-4 transition-all select-none outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-card/80',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground leading-snug">{chart.title}</p>
                {isLive(chart.id) && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    Live
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {chart.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {chart.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
