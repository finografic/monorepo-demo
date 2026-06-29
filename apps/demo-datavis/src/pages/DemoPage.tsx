import { DemoLayout, StandbyPlaceholder } from '@workspace/shared/components';
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
    <DemoLayout
      header={{
        title: 'Transport Data Dashboard',
        subtitle: 'QLD transport data · Recharts · D3 · CKAN live API',
      }}
      sidebar={
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <ChartSelector
            ref={selectorRef}
            charts={CHARTS}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onFocusChart={handleFocusChart}
          />
        </div>
      }
      sidebarLabel="Chart navigation"
      footer={
        <p className="text-sm text-primary-foreground">
          WCAG 2.1 AA · Accessible data charts
          <span className="mt-0.5 mx-4 text-primary-foreground/60">
            Keyboard navigable · → chart · ← or Esc sidebar
          </span>
        </p>
      }
    >
      {selectedChart ? (
        <ChartPane ref={chartPaneRef} chart={selectedChart} onReturnToSidebar={handleReturnToSidebar} />
      ) : (
        <StandbyPlaceholder label="Choose from 5 mock datasets and 2 live API views in the sidebar." />
      )}
    </DemoLayout>
  );
}
