import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { area, line } from 'd3-shape';
import { CALL_VOLUME_DATA } from 'data/call-volume';
import { useEffect, useRef } from 'react';

interface ParsedRow {
  date: Date;
  enquiries: number;
}

const PARSED: ParsedRow[] = CALL_VOLUME_DATA.map((d) => ({
  date: new Date(d.date),
  enquiries: d.enquiries,
}));

const MARGIN = { top: 16, right: 32, bottom: 52, left: 64 };
const HEIGHT = 360;
const CHART_ID = 'call-volume-chart-title';

export function CallVolumeChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    const totalWidth = container.getBoundingClientRect().width || 640;
    const w = totalWidth - MARGIN.left - MARGIN.right;
    const h = HEIGHT - MARGIN.top - MARGIN.bottom;

    const root = select(svgEl);
    root.selectAll('*').remove();
    root
      .attr('width', totalWidth)
      .attr('height', HEIGHT)
      .attr('viewBox', `0 0 ${totalWidth} ${HEIGHT}`)
      .attr('aria-hidden', 'true');

    // Gradient definition
    const defs = root.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', 'cv-area-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    grad.append('stop').attr('offset', '5%').attr('stop-color', 'var(--primary)').attr('stop-opacity', 0.28);
    grad.append('stop').attr('offset', '95%').attr('stop-color', 'var(--primary)').attr('stop-opacity', 0.02);

    const g = root.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const xScale = scaleTime()
      .domain([PARSED[0]!.date, PARSED[PARSED.length - 1]!.date])
      .range([0, w]);

    const yMax = Math.max(...PARSED.map((d) => d.enquiries));
    const yScale = scaleLinear()
      .domain([0, yMax * 1.12])
      .nice()
      .range([h, 0]);

    // Horizontal grid lines
    g.append('g')
      .selectAll<SVGLineElement, number>('line')
      .data(yScale.ticks(5))
      .join('line')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'var(--border)')
      .attr('stroke-dasharray', '3 3');

    // Area fill
    const areaGen = area<ParsedRow>()
      .x((d) => xScale(d.date))
      .y0(h)
      .y1((d) => yScale(d.enquiries));

    g.append('path').datum(PARSED).attr('d', areaGen).attr('fill', 'url(#cv-area-gradient)');

    // Line stroke
    const lineGen = line<ParsedRow>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.enquiries));

    g.append('path')
      .datum(PARSED)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2.5);

    // Data dots
    g.selectAll<SVGCircleElement, ParsedRow>('circle')
      .data(PARSED)
      .join('circle')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.enquiries))
      .attr('r', 3.5)
      .attr('fill', 'var(--primary)');

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(
        axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => (d as Date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })),
      )
      .call((ax) => ax.select('.domain').attr('stroke', 'var(--border)'))
      .call((ax) => ax.selectAll('.tick line').attr('stroke', 'var(--border)'))
      .call((ax) =>
        ax
          .selectAll<SVGTextElement, unknown>('text')
          .attr('fill', 'var(--muted-foreground)')
          .style('font-size', '11px')
          .attr('transform', 'rotate(-30)')
          .attr('text-anchor', 'end'),
      );

    // Y axis
    g.append('g')
      .call(
        axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => (d as number).toLocaleString()),
      )
      .call((ax) => ax.select('.domain').attr('stroke', 'var(--border)'))
      .call((ax) => ax.selectAll('.tick line').attr('stroke', 'var(--border)'))
      .call((ax) =>
        ax
          .selectAll<SVGTextElement, unknown>('text')
          .attr('fill', 'var(--muted-foreground)')
          .style('font-size', '11px'),
      );

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -MARGIN.left + 18)
      .attr('x', -(h / 2))
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted-foreground)')
      .style('font-size', '11px')
      .text('Enquiries');
  }, []);

  return (
    <div role="img" aria-labelledby={CHART_ID} className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        D3 area chart: daily registration call centre enquiries for May 2026. Weekday peaks ~1,800–2,300
        calls; weekend lows ~400. Built with D3 select, scaleTime, area, line, axisBottom, axisLeft.
      </h3>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="block" />
      </div>

      <table className="sr-only">
        <caption>Daily registration call centre enquiries, May 2026</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Enquiries</th>
          </tr>
        </thead>
        <tbody>
          {CALL_VOLUME_DATA.map((row) => (
            <tr key={row.date}>
              <td>{row.date}</td>
              <td>{row.enquiries}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
