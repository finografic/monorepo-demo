import { resolveBadgeClass } from '@workspace/shared';
import { OptionCard } from '@workspace/shared/components';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { ChartMeta } from 'data/types';

export interface ChartSelectorHandle {
  focusSelected: () => void;
}

interface ChartSelectorProps {
  charts: ChartMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFocusChart?: () => void;
}

const chartTagColors: Record<string, string> = {
  'Grouped bar': 'sky',
  'Bar chart': 'sky',
  'Area chart': 'sky',
  'Line chart': 'sky',
  'Heatmap': 'sky',
  'Scatter plot': 'orange',
  'D3': 'amber',
  'Customer service': 'green',
  'KPI': 'rose',
  'Call centre': 'purple',
  'Trend': 'teal',
  'Traffic patterns': 'purple',
  'Translink': 'purple',
  'Satisfaction': 'green',
  'Road network': 'amber',
  'Census': 'rose',
  'Live API': 'green',
  'CKAN': 'amber',
  'TMR datasets': 'blue',
  'Wait times': 'rose',
};

const LIVE_IDS = new Set(['live-catalogue', 'live-wait-times']);

const LiveBadge = (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
    Live
  </span>
);

function focusChartAfterPaint(onFocusChart?: () => void) {
  if (!onFocusChart) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(onFocusChart);
  });
}

export const ChartSelector = forwardRef<ChartSelectorHandle, ChartSelectorProps>(function ChartSelector(
  { charts, selectedId, onSelect, onFocusChart },
  ref,
) {
  const listRef = useRef<HTMLUListElement>(null);

  const focusSelected = useCallback(() => {
    const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
    if (!items?.length) return;
    const selectedIndex = charts.findIndex((chart) => chart.id === selectedId);
    const index = selectedIndex >= 0 ? selectedIndex : 0;
    items[index]?.focus();
  }, [charts, selectedId]);

  useImperativeHandle(ref, () => ({ focusSelected }), [focusSelected]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
      const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
      if (!items) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[Math.min(index + 1, items.length - 1)]?.focus();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[Math.max(index - 1, 0)]?.focus();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const { id } = charts[index]!;
        if (selectedId !== id) onSelect(id);
        focusChartAfterPaint(onFocusChart);
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(charts[index]!.id);
        focusChartAfterPaint(onFocusChart);
      }
    },
    [charts, onFocusChart, onSelect, selectedId],
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
            sourceContext={chart.source}
            sourceContextLabel={LIVE_IDS.has(chart.id) ? 'Live source' : 'Data basis'}
            badges={chart.tags.map((tag) => ({
              label: tag,
              className: resolveBadgeClass(chartTagColors[tag] ?? 'blue'),
            }))}
            selected={chart.id === selectedId}
            headerAction={LIVE_IDS.has(chart.id) ? LiveBadge : undefined}
            onSelect={() => onSelect(chart.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </ul>
    </nav>
  );
});
