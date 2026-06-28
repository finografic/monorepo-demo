import { scaleSequential } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';
import { DAY_LABELS, HEATMAP_DATA, HOUR_LABELS } from 'data/traffic-heatmap';
import { useMemo, useRef } from 'react';

const CELL_W = 32;
const CELL_H = 32;
const MARGIN = { top: 24, right: 16, bottom: 48, left: 40 };

const CHART_ID = 'heatmap-chart-title';

function useHeatmapColour() {
  const maxVolume = useMemo(() => Math.max(...HEATMAP_DATA.map((d) => d.volume)), []);
  return useMemo(() => scaleSequential(interpolateBlues).domain([0, maxVolume]), [maxVolume]);
}

function labelColor(bg: string): string {
  const hex = bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.45 ? '#1a1a2e' : '#ffffff';
}

export function TrafficHeatmap() {
  const colourScale = useHeatmapColour();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const svgWidth = MARGIN.left + 24 * CELL_W + MARGIN.right;
  const svgHeight = MARGIN.top + 7 * CELL_H + MARGIN.bottom;

  function showTooltip(e: React.MouseEvent, cell: { day: number; hour: number; volume: number }) {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    tooltip.textContent = `${DAY_LABELS[cell.day]} ${HOUR_LABELS[cell.hour]}: ${cell.volume.toLocaleString()} vehicles`;
    tooltip.style.opacity = '1';
    tooltip.style.left = `${e.nativeEvent.offsetX + 12}px`;
    tooltip.style.top = `${e.nativeEvent.offsetY - 32}px`;
  }

  function hideTooltip() {
    const tooltip = tooltipRef.current;
    if (tooltip) tooltip.style.opacity = '0';
  }

  return (
    <div role="img" aria-labelledby={CHART_ID} className="w-full overflow-x-auto relative">
      <h3 id={CHART_ID} className="sr-only">
        Heatmap: average traffic volumes by day of week (rows) and hour of day (columns). Darker blue
        indicates higher traffic volume. Peak periods are weekday mornings 7–9am and afternoons 4–6pm.
      </h3>

      <div className="relative inline-block min-w-full">
        <svg
          width={svgWidth}
          height={svgHeight}
          aria-hidden="true"
          className="block mx-auto"
          style={{ maxWidth: '100%' }}
        >
          {/* Hour labels (x-axis) */}
          {HOUR_LABELS.map((label, h) =>
            h % 3 === 0 ? (
              <text
                key={label}
                x={MARGIN.left + h * CELL_W + CELL_W / 2}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {label}
              </text>
            ) : null,
          )}

          {/* Day labels (y-axis) */}
          {DAY_LABELS.map((label, d) => (
            <text
              key={label}
              x={MARGIN.left - 6}
              y={MARGIN.top + d * CELL_H + CELL_H / 2 + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              {label}
            </text>
          ))}

          {/* Heatmap cells */}
          {HEATMAP_DATA.map((cell) => {
            const bg = colourScale(cell.volume);
            const x = MARGIN.left + cell.hour * CELL_W;
            const y = MARGIN.top + cell.day * CELL_H;
            return (
              <g
                key={`${cell.day}-${cell.hour}`}
                role="gridcell"
                aria-label={`${DAY_LABELS[cell.day]} ${HOUR_LABELS[cell.hour]}: ${cell.volume} vehicles`}
                tabIndex={0}
                onMouseMove={(e) => showTooltip(e, cell)}
                onMouseLeave={hideTooltip}
                onFocus={(e) => showTooltip(e as unknown as React.MouseEvent, cell)}
                onBlur={hideTooltip}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <rect x={x + 1} y={y + 1} width={CELL_W - 2} height={CELL_H - 2} fill={bg} rx={2} />
                {cell.volume > 600 && (
                  <text
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2 + 4}
                    textAnchor="middle"
                    fontSize={8}
                    fill={labelColor(bg)}
                    pointerEvents="none"
                  >
                    {Math.round(cell.volume / 10) * 10}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none absolute rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground shadow-md opacity-0 transition-opacity whitespace-nowrap z-10"
          aria-live="polite"
        />
      </div>

      {/* Colour legend */}
      <div className="mt-3 flex items-center gap-3 justify-center text-xs text-muted-foreground">
        <span>Low traffic</span>
        <div
          className="h-3 w-36 rounded"
          style={{ background: 'linear-gradient(to right, #deebf7, #08519c)' }}
          aria-hidden="true"
        />
        <span>High traffic</span>
      </div>

      <table className="sr-only">
        <caption>Traffic volumes by day of week and hour of day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            {HOUR_LABELS.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_LABELS.map((day, d) => (
            <tr key={day}>
              <th scope="row">{day}</th>
              {HEATMAP_DATA.filter((c) => c.day === d).map((c) => (
                <td key={c.hour}>{c.volume}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
