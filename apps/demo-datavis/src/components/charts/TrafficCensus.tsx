import { TRAFFIC_CENSUS_DATA } from 'data/traffic-census';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CHART_ID = 'traffic-census-chart-title';
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: 13,
};
const X_LABEL = {
  value: 'AADT (thousands)',
  position: 'insideBottomRight' as const,
  offset: -8,
  style: { fontSize: 11, fill: 'var(--muted-foreground)' },
};

const chartData = TRAFFIC_CENSUS_DATA.map((row) => ({
  ...row,
  label: `${row.road} (${row.location})`,
  aadtK: Math.round(row.aadt / 100) / 10,
}));

export function TrafficCensus() {
  return (
    <div role="img" aria-labelledby={CHART_ID} className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Horizontal bar chart: top 10 QLD state-declared roads by annual average daily traffic (AADT). M1
        Pacific Motorway at Coomera is highest at 84,200 vehicles per day.
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 64, left: 8, bottom: 8 }}
          aria-hidden="true"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(v: number) => `${v}k`}
            label={X_LABEL}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={180}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number, _name: string, props: { payload?: { heavyVehiclePct?: number } }) =>
              `${(value * 1000).toLocaleString()} vehicles/day (${props.payload?.heavyVehiclePct ?? 0}% heavy)`
            }
          />
          <Bar dataKey="aadtK" radius={BAR_RADIUS} isAnimationActive={false}>
            {chartData.map((row, i) => (
              <Cell
                key={`${row.road}-${row.location}`}
                fill={`oklch(${0.237 + i * 0.028} ${0.161 - i * 0.01} 254.944)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Annual average daily traffic for top 10 QLD state-declared roads</caption>
        <thead>
          <tr>
            <th scope="col">Road</th>
            <th scope="col">Location</th>
            <th scope="col">AADT</th>
            <th scope="col">Heavy vehicle %</th>
          </tr>
        </thead>
        <tbody>
          {TRAFFIC_CENSUS_DATA.map((row) => (
            <tr key={`${row.road}-${row.location}`}>
              <td>{row.road}</td>
              <td>{row.location}</td>
              <td>{row.aadt.toLocaleString()}</td>
              <td>{row.heavyVehiclePct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
