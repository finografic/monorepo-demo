import { OptionCard } from '@workspace/shared';
import { useCallback, useRef } from 'react';
import type { ChartMeta } from 'data/types';

interface ChartSelectorProps {
  charts: ChartMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const LIVE_IDS = new Set(['live-catalogue', 'live-wait-times']);

const LIVE_BADGE = (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
    Live
  </span>
);

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

  return (
    <nav aria-label="Available charts">
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Chart selection"
        aria-orientation="vertical"
        className="space-y-2"
      >
        {charts.map((chart, index) => (
          <OptionCard
            key={chart.id}
            title={chart.title}
            description={chart.description}
            badges={chart.tags.map((tag) => ({ label: tag }))}
            selected={chart.id === selectedId}
            headerAction={LIVE_IDS.has(chart.id) ? LIVE_BADGE : undefined}
            onSelect={() => onSelect(chart.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </ul>
    </nav>
  );
}
