import { DemoLayout, StandbyPlaceholder } from '@workspace/shared/components';
import { ChartPane } from 'components/ChartPane/ChartPane';
import { ChartSelector } from 'components/ChartSelector/ChartSelector';
import { CHARTS } from 'data/charts';
import { useCallback, useRef, useState } from 'react';
import type { ChartPaneHandle } from 'components/ChartPane/ChartPane';
import type { ChartSelectorHandle } from 'components/ChartSelector/ChartSelector';

export function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const selectorRef = useRef<ChartSelectorHandle>(null);
  const chartPaneRef = useRef<ChartPaneHandle>(null);

  const selectedChart = CHARTS.find((c) => c.id === selectedId) ?? null;

  const handleFocusChart = useCallback(() => {
    chartPaneRef.current?.focusChart();
  }, []);

  const handleReturnToSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
    requestAnimationFrame(() => {
      selectorRef.current?.focusSelected();
    });
  }, []);

  const handleSelectChart = useCallback((id: string) => {
    setSelectedId(id);
    setIsMobileSidebarOpen(false);
  }, []);

  return (
    <DemoLayout
      header={{
        title: 'Demo 2: Transport Data Dashboard',
        subtitle: 'QLD transport data · Recharts · D3 · CKAN live API',
      }}
      mobileSidebarOpen={isMobileSidebarOpen}
      onMobileSidebarOpenChange={setIsMobileSidebarOpen}
      sidebar={
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:py-5">
          <ChartSelector
            ref={selectorRef}
            charts={CHARTS}
            selectedId={selectedId}
            onSelect={handleSelectChart}
            onFocusChart={handleFocusChart}
          />
        </div>
      }
      sidebarLabel="Chart navigation"
      footer={
        <>
          <p className="text-sm text-primary-foreground">WCAG 2.1 AA · Accessible data charts</p>
          <p className="text-sm text-primary-foreground/60">
            Keyboard navigable · → chart · ← or Esc sidebar
          </p>
        </>
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
