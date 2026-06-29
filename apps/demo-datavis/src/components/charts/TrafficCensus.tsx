import { TRAFFIC_CENSUS_DATA } from 'data/traffic-census';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BarShapeProps } from 'recharts';

import {
  CHART_AXIS_TICK_PROPS_SM,
  CHART_ENTRANCE_ANIMATION,
  CHART_GRID_DASH,
  CHART_GRID_STROKE,
  TOOLTIP_STYLE,
  chartXAxisLabelBottomRight,
} from 'constants/charts.config';

const CHART_ID = 'traffic-census-chart-title';
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const X_LABEL = chartXAxisLabelBottomRight('AADT (thousands)');

interface CensusChartRow {
  road: string;
  location: string;
  aadt: number;
  heavyVehiclePct: number;
  label: string;
  aadtK: number;
  barFill: string;
}

function censusBarFill(index: number): string {
  return `oklch(${0.237 + index * 0.028} ${0.161 - index * 0.01} 254.944)`;
}

const chartData: CensusChartRow[] = TRAFFIC_CENSUS_DATA.map((row, index) => ({
  ...row,
  label: `${row.road} (${row.location})`,
  aadtK: Math.round(row.aadt / 100) / 10,
  barFill: censusBarFill(index),
}));

function CensusBarShape(props: BarShapeProps) {
  const { x, y, width, height, payload } = props;
  const fill = (payload as CensusChartRow | undefined)?.barFill ?? 'var(--primary)';

  return <Rectangle x={x} y={y} width={width} height={height} radius={BAR_RADIUS} fill={fill} />;
}

export function TrafficCensus() {
  return (
    <div className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Horizontal bar chart: top 10 QLD state-declared roads by annual average daily traffic (AADT). M1
        Pacific Motorway at Coomera is highest at 84,200 vehicles per day.
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 64, left: 8, bottom: 8 }}
          tabIndex={0}
          aria-labelledby={CHART_ID}
        >
          <CartesianGrid strokeDasharray={CHART_GRID_DASH} stroke={CHART_GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            tick={CHART_AXIS_TICK_PROPS_SM}
            tickFormatter={(v: number) => `${v}k`}
            label={X_LABEL}
          />
          <YAxis type="category" dataKey="label" width={180} tick={CHART_AXIS_TICK_PROPS_SM} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, _name, item) => {
              const aadtK = typeof value === 'number' ? value : Number(value ?? 0);
              const heavyVehiclePct =
                (item.payload as { heavyVehiclePct?: number } | undefined)?.heavyVehiclePct ?? 0;
              return `${(aadtK * 1000).toLocaleString()} vehicles/day (${heavyVehiclePct}% heavy)`;
            }}
          />
          <Bar dataKey="aadtK" radius={BAR_RADIUS} shape={CensusBarShape} {...CHART_ENTRANCE_ANIMATION} />
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
