import { scaleSequential } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';
import { DAY_LABELS, HEATMAP_DATA, HOUR_LABELS } from 'data/traffic-heatmap';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { HeatmapCell } from 'data/types';

const CELL_W = 32;
const CELL_H = 32;
const MARGIN = { top: 24, right: 16, bottom: 48, left: 40 };
const ROW_COUNT = 7;
const COL_COUNT = 24;

const CHART_ID = 'heatmap-chart-title';

function cellId(day: number, hour: number): string {
  return `heatmap-cell-${day}-${hour}`;
}

function cellLabel(cell: HeatmapCell): string {
  return `${DAY_LABELS[cell.day]} ${HOUR_LABELS[cell.hour]}: ${cell.volume.toLocaleString()} vehicles`;
}

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
  const gridRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<HeatmapCell | null>(null);
  const [hoverCell, setHoverCell] = useState<HeatmapCell | null>(null);

  const svgWidth = MARGIN.left + COL_COUNT * CELL_W + MARGIN.right;
  const svgHeight = MARGIN.top + ROW_COUNT * CELL_H + MARGIN.bottom;

  const displayedCell = hoverCell ?? activeCell;

  const positionTooltip = useCallback((clientX: number, clientY: number) => {
    const tooltip = tooltipRef.current;
    const container = gridRef.current;
    if (!tooltip || !container) return;

    const bounds = container.getBoundingClientRect();
    tooltip.style.opacity = '1';
    tooltip.style.left = `${clientX - bounds.left + 12}px`;
    tooltip.style.top = `${clientY - bounds.top - 32}px`;
  }, []);

  const showTooltipForCell = useCallback(
    (cell: HeatmapCell, clientX: number, clientY: number) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      tooltip.textContent = cellLabel(cell);
      positionTooltip(clientX, clientY);
    },
    [positionTooltip],
  );

  const hideTooltip = useCallback(() => {
    const tooltip = tooltipRef.current;
    if (tooltip) tooltip.style.opacity = '0';
    setHoverCell(null);
  }, []);

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const current = activeCell ?? HEATMAP_DATA[0]!;
      let { day, hour } = current;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          hour = Math.min(COL_COUNT - 1, hour + 1);
          break;
        case 'ArrowLeft':
          if (hour === 0) return;
          e.preventDefault();
          e.stopPropagation();
          hour = hour - 1;
          break;
        case 'ArrowDown':
          e.preventDefault();
          day = Math.min(ROW_COUNT - 1, day + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          day = Math.max(0, day - 1);
          break;
        case 'Home':
          e.preventDefault();
          hour = 0;
          break;
        case 'End':
          e.preventDefault();
          hour = COL_COUNT - 1;
          break;
        default:
          return;
      }

      const next = HEATMAP_DATA.find((cell) => cell.day === day && cell.hour === hour);
      if (!next) return;

      setActiveCell(next);
      setHoverCell(null);

      const tooltip = tooltipRef.current;
      const grid = gridRef.current;
      if (tooltip && grid) {
        tooltip.textContent = cellLabel(next);
        const cellEl = grid.querySelector<SVGElement>(`#${cellId(next.day, next.hour)}`);
        if (cellEl) {
          const rect = cellEl.getBoundingClientRect();
          positionTooltip(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    },
    [activeCell, positionTooltip],
  );

  const handleGridFocus = useCallback(() => {
    const initial = activeCell ?? HEATMAP_DATA[0]!;
    if (!activeCell) setActiveCell(initial);

    const cell = activeCell ?? initial;
    const grid = gridRef.current;
    const tooltip = tooltipRef.current;
    if (!grid || !tooltip) return;

    tooltip.textContent = cellLabel(cell);
    const cellEl = grid.querySelector<SVGElement>(`#${cellId(cell.day, cell.hour)}`);
    if (cellEl) {
      const rect = cellEl.getBoundingClientRect();
      positionTooltip(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }, [activeCell, positionTooltip]);

  const handleGridBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (gridRef.current?.contains(e.relatedTarget)) return;
      hideTooltip();
    },
    [hideTooltip],
  );

  return (
    <div className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Heatmap: average traffic volumes by day of week (rows) and hour of day (columns). Darker blue
        indicates higher traffic volume. Peak periods are weekday mornings 7–9am and afternoons 4–6pm. Use
        arrow keys to move between cells when the grid is focused.
      </h3>

      <div
        ref={gridRef}
        role="grid"
        tabIndex={0}
        aria-labelledby={CHART_ID}
        aria-rowcount={ROW_COUNT}
        aria-colcount={COL_COUNT}
        aria-activedescendant={activeCell ? cellId(activeCell.day, activeCell.hour) : cellId(0, 0)}
        onKeyDown={handleGridKeyDown}
        onFocus={handleGridFocus}
        onBlur={handleGridBlur}
        className="relative rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" className="block">
          {HOUR_LABELS.map((label, h) =>
            h % 3 === 0 ? (
              <text
                key={label}
                aria-hidden="true"
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

          {DAY_LABELS.map((label, d) => (
            <text
              key={label}
              aria-hidden="true"
              x={MARGIN.left - 6}
              y={MARGIN.top + d * CELL_H + CELL_H / 2 + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              {label}
            </text>
          ))}

          {HEATMAP_DATA.map((cell) => {
            const bg = colourScale(cell.volume);
            const x = MARGIN.left + cell.hour * CELL_W;
            const y = MARGIN.top + cell.day * CELL_H;
            const isActive =
              activeCell?.day === cell.day && activeCell.hour === cell.hour && hoverCell === null;
            const isHovered = hoverCell?.day === cell.day && hoverCell.hour === cell.hour;

            return (
              <g
                key={`${cell.day}-${cell.hour}`}
                id={cellId(cell.day, cell.hour)}
                role="gridcell"
                aria-selected={isActive || isHovered}
                aria-label={cellLabel(cell)}
                onMouseEnter={(e) => {
                  setHoverCell(cell);
                  showTooltipForCell(cell, e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  if (hoverCell?.day === cell.day && hoverCell.hour === cell.hour) {
                    positionTooltip(e.clientX, e.clientY);
                  }
                }}
                onMouseLeave={hideTooltip}
              >
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  fill={bg}
                  rx={2}
                  stroke={isActive || isHovered ? 'var(--ring)' : 'transparent'}
                  strokeWidth={isActive || isHovered ? 2 : 0}
                />
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

        <div
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none absolute rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground shadow-md opacity-0 transition-opacity whitespace-nowrap z-10"
          aria-live="polite"
        >
          {displayedCell ? cellLabel(displayedCell) : ''}
        </div>
      </div>

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
