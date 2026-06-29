import { TRANSLINK_DATA } from 'data/translink-performance';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  CHART_AXIS_TICK_PROPS_MD,
  CHART_ENTRANCE_ANIMATION,
  CHART_GRID_DASH,
  CHART_GRID_STROKE,
  LEGEND_STYLE,
  TOOLTIP_STYLE,
  chartYAxisLabelLeft,
  chartYAxisLabelRight,
} from 'constants/charts.config';

const CHART_ID = 'translink-chart-title';
const SATISFACTION_LABEL = chartYAxisLabelLeft('Satisfaction %', 14);
const COMPLAINTS_LABEL = chartYAxisLabelRight('Complaints', 8);
const SATISFACTION_DOMAIN: [number, number] = [80, 92];
const COMPLAINTS_DOMAIN: [number, number] = [80, 200];

export function TranslinkPerformance() {
  return (
    <div className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Dual-line chart showing Translink customer satisfaction percentage (left axis, rising from 84% to 89%)
        and monthly complaint count (right axis, falling from 178 to 114) over Jan–Dec 2025
      </h3>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={TRANSLINK_DATA}
          margin={{ top: 8, right: 56, left: 0, bottom: 8 }}
          tabIndex={0}
          aria-labelledby={CHART_ID}
        >
          <CartesianGrid strokeDasharray={CHART_GRID_DASH} stroke={CHART_GRID_STROKE} />
          <XAxis dataKey="month" tick={CHART_AXIS_TICK_PROPS_MD} />
          <YAxis
            yAxisId="satisfaction"
            domain={SATISFACTION_DOMAIN}
            tick={CHART_AXIS_TICK_PROPS_MD}
            tickFormatter={(v: number) => `${v}%`}
            label={SATISFACTION_LABEL}
          />
          <YAxis
            yAxisId="complaints"
            orientation="right"
            domain={COMPLAINTS_DOMAIN}
            tick={CHART_AXIS_TICK_PROPS_MD}
            label={COMPLAINTS_LABEL}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => {
              if (value == null) return '';
              return name === 'Satisfaction' ? `${String(value)}%` : value;
            }}
          />
          <Legend verticalAlign="top" wrapperStyle={LEGEND_STYLE} />
          <Line
            yAxisId="satisfaction"
            type="monotone"
            dataKey="satisfactionPct"
            name="Satisfaction"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
            {...CHART_ENTRANCE_ANIMATION}
          />
          <Line
            yAxisId="complaints"
            type="monotone"
            dataKey="complaints"
            name="Complaints"
            stroke="oklch(0.6 0.15 30)"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: 'oklch(0.6 0.15 30)', strokeWidth: 0 }}
            {...CHART_ENTRANCE_ANIMATION}
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Translink monthly performance 2025: satisfaction and complaints</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Satisfaction %</th>
            <th scope="col">Complaints</th>
          </tr>
        </thead>
        <tbody>
          {TRANSLINK_DATA.map((row) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              <td>{row.satisfactionPct}%</td>
              <td>{row.complaints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
