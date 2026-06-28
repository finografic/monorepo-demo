import { ChartPane } from 'components/ChartPane/ChartPane';
import { ChartSelector } from 'components/ChartSelector/ChartSelector';
import { CHARTS } from 'data/charts';
import { useState } from 'react';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedChart = CHARTS.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {/* Left panel — chart selection */}
      <aside
        className="flex-none overflow-hidden border-b border-border md:w-[30rem] md:border-b-0 md:border-r lg:w-[32rem] flex flex-col"
        aria-label="Chart navigation"
      >
        <div className="border-b border-border px-5 py-5">
          <h1 className="text-base font-semibold text-foreground">Transport Data Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            QLD transport data · Recharts · D3 · CKAN live API
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <ChartSelector charts={CHARTS} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div className="border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground/60 text-center">
            WCAG 2.1 AA · Accessible data tables · Keyboard navigable
          </p>
        </div>
      </aside>

      {/* Right panel — chart output */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedChart ? <ChartPane chart={selectedChart} /> : <StandbyPlaceholder />}
      </main>
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
          Choose from 5 mock datasets and 1 live API view in the sidebar.
        </p>
      </div>
    </div>
  );
}
