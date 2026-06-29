import { ChartPane } from 'components/ChartPane/ChartPane';
import { ChartSelector } from 'components/ChartSelector/ChartSelector';
import { CHARTS } from 'data/charts';
import { useCallback, useRef, useState } from 'react';
import type { ChartPaneHandle } from 'components/ChartPane/ChartPane';
import type { ChartSelectorHandle } from 'components/ChartSelector/ChartSelector';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectorRef = useRef<ChartSelectorHandle>(null);
  const chartPaneRef = useRef<ChartPaneHandle>(null);

  const selectedChart = CHARTS.find((c) => c.id === selectedId) ?? null;

  const handleFocusChart = useCallback(() => {
    chartPaneRef.current?.focusChart();
  }, []);

  const handleReturnToSidebar = useCallback(() => {
    selectorRef.current?.focusSelected();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex-none bg-primary px-6 py-4">
        <h1 className="text-base font-semibold text-primary-foreground">Transport Data Dashboard</h1>
        <p className="mt-0.5 text-sm text-primary-foreground/75">
          QLD transport data · Recharts · D3 · CKAN live API
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="flex-none w-[30rem] lg:w-[32rem] border-r border-border flex flex-col overflow-hidden"
          aria-label="Chart navigation"
        >
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <ChartSelector
              ref={selectorRef}
              charts={CHARTS}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onFocusChart={handleFocusChart}
            />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedChart ? (
            <ChartPane ref={chartPaneRef} chart={selectedChart} onReturnToSidebar={handleReturnToSidebar} />
          ) : (
            <StandbyPlaceholder />
          )}
        </main>
      </div>
    </div>
  );
}

function StandbyPlaceholder() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs px-6">
        <div
          className="flex size-16 items-center justify-center rounded-2xl bg-primary/10"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-8 text-primary" aria-hidden="true">
            <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M7 16l4-4 4 4 4-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-foreground">Select a chart to begin</p>
        <p className="text-sm text-muted-foreground">
          Choose from 5 mock datasets and 2 live API views in the sidebar.
        </p>
      </div>
    </div>
  );
}
