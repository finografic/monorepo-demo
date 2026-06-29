import { CallVolumeChart } from 'components/charts/CallVolumeChart';
import { LiveCatalogue } from 'components/charts/LiveCatalogue';
import { LiveWaitTimesChart } from 'components/charts/LiveWaitTimesChart';
import { TrafficCensus } from 'components/charts/TrafficCensus';
import { TrafficHeatmap } from 'components/charts/TrafficHeatmap';
import { TranslinkPerformance } from 'components/charts/TranslinkPerformance';
import { WaitTimesChart } from 'components/charts/WaitTimesChart';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { ChartMeta } from 'data/types';

export interface ChartPaneHandle {
  focusChart: () => void;
}

interface ChartPaneProps {
  chart: ChartMeta;
  onReturnToSidebar?: () => void;
}

function ChartComponent({ id }: { id: string }) {
  switch (id) {
    case 'wait-times':
      return <WaitTimesChart />;
    case 'call-volume':
      return <CallVolumeChart />;
    case 'traffic-heatmap':
      return <TrafficHeatmap />;
    case 'translink-performance':
      return <TranslinkPerformance />;
    case 'traffic-census':
      return <TrafficCensus />;
    case 'live-catalogue':
      return <LiveCatalogue />;
    case 'live-wait-times':
      return <LiveWaitTimesChart />;
    default:
      return null;
  }
}

function findChartFocusTarget(root: HTMLElement): HTMLElement | null {
  return (
    root.querySelector<HTMLElement>('[role="grid"][tabindex="0"]') ??
    root.querySelector<HTMLElement>('[role="region"][tabindex="0"]') ??
    root.querySelector<HTMLElement>('.recharts-wrapper [tabindex="0"]') ??
    root.querySelector<HTMLElement>('[tabindex="0"]')
  );
}

export const ChartPane = forwardRef<ChartPaneHandle, ChartPaneProps>(function ChartPane(
  { chart, onReturnToSidebar },
  ref,
) {
  const chartAreaRef = useRef<HTMLDivElement>(null);

  const focusChart = useCallback(() => {
    const root = chartAreaRef.current;
    if (!root) return;
    findChartFocusTarget(root)?.focus();
  }, []);

  useImperativeHandle(ref, () => ({ focusChart }), [focusChart]);

  const handleChartKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' || e.key === 'ArrowLeft') {
        e.preventDefault();
        onReturnToSidebar?.();
      }
    },
    [onReturnToSidebar],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-5">
        <h2 className="text-2xl font-semibold text-foreground">{chart.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{chart.description}</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-8 py-6 flex flex-col">
        <div
          key={chart.id}
          ref={chartAreaRef}
          className="my-auto w-full [@media(min-height:800px)]:pb-[25vh]"
          onKeyDown={handleChartKeyDown}
        >
          <ChartComponent id={chart.id} />
        </div>
      </div>

      <div className="min-h-16 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border bg-background px-8 py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Source:</span>{' '}
          <a
            href={chart.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {chart.source}
          </a>
        </p>
        <span className="text-muted-foreground/40 text-xs hidden sm:inline" aria-hidden="true">
          ·
        </span>
        {chart.id === 'live-catalogue' || chart.id === 'live-wait-times' ? (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            Live data — Queensland Open Data CKAN API
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70">
            Mock data — shapes inspired by Queensland Open Data (data.qld.gov.au). Not official TMR reporting.
          </p>
        )}
      </div>
    </div>
  );
});
