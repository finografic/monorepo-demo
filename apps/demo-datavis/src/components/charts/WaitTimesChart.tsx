import { WAIT_TIMES_DATA } from 'data/wait-times';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  CHART_AXIS_TICK_PROPS_MD,
  CHART_GRID_DASH,
  CHART_GRID_STROKE,
  LEGEND_STYLE,
  TOOLTIP_STYLE,
  chartYAxisLabelLeft,
} from 'constants/charts.config';

const CHART_ID = 'wait-times-chart-title';
const BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0];
const Y_LABEL = chartYAxisLabelLeft('Minutes', 12);

export function WaitTimesChart() {
  return (
    <div className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Grouped bar chart: average wait and serve times in minutes for 8 QLD transport service centres
      </h3>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={WAIT_TIMES_DATA}
          margin={{ top: 8, right: 24, left: 0, bottom: 80 }}
          tabIndex={0}
          aria-labelledby={CHART_ID}
        >
          <CartesianGrid strokeDasharray={CHART_GRID_DASH} stroke={CHART_GRID_STROKE} />
          <XAxis
            dataKey="centre"
            tick={CHART_AXIS_TICK_PROPS_MD}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={80}
          />
          <YAxis tick={CHART_AXIS_TICK_PROPS_MD} label={Y_LABEL} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => {
              const minutes = typeof value === 'number' ? value : Number(value ?? 0);
              return `${minutes.toFixed(1)} min`;
            }}
          />
          <Legend verticalAlign="top" wrapperStyle={LEGEND_STYLE} />
          <Bar
            dataKey="avgWaitMin"
            name="Avg wait"
            fill="var(--primary)"
            radius={BAR_RADIUS}
            isAnimationActive={false}
          />
          <Bar
            dataKey="avgServeMin"
            name="Avg serve"
            fill="oklch(0.65 0.12 254)"
            radius={BAR_RADIUS}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Customer service centre average wait and serve times</caption>
        <thead>
          <tr>
            <th scope="col">Centre</th>
            <th scope="col">Avg wait (min)</th>
            <th scope="col">Avg serve (min)</th>
            <th scope="col">Daily customers</th>
          </tr>
        </thead>
        <tbody>
          {WAIT_TIMES_DATA.map((row) => (
            <tr key={row.centre}>
              <td>{row.centre}</td>
              <td>{row.avgWaitMin}</td>
              <td>{row.avgServeMin}</td>
              <td>{row.dailyCustomers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
