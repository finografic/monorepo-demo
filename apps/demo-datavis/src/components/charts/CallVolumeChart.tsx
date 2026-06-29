import { CALL_VOLUME_DATA } from 'data/call-volume';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  CHART_AXIS_TICK_PROPS_SM,
  CHART_GRID_DASH,
  CHART_GRID_STROKE,
  TOOLTIP_STYLE,
  chartYAxisLabelLeft,
} from 'constants/charts.config';

const CHART_ID = 'call-volume-chart-title';
const Y_LABEL = chartYAxisLabelLeft('Enquiries', 12);

const chartData = CALL_VOLUME_DATA.map((row) => ({
  ...row,
  label: new Date(row.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
}));

function formatDateTick(value: string): string {
  return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function CallVolumeChart() {
  return (
    <div className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Area chart: daily registration call centre enquiries for May 2026. Weekday peaks around 1,800–2,300
        calls; weekend lows around 400.
      </h3>

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 32, left: 8, bottom: 56 }}
          tabIndex={0}
          aria-labelledby={CHART_ID}
        >
          <defs>
            <linearGradient id="call-volume-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray={CHART_GRID_DASH} stroke={CHART_GRID_STROKE} />
          <XAxis
            dataKey="date"
            tick={CHART_AXIS_TICK_PROPS_SM}
            tickFormatter={formatDateTick}
            angle={-30}
            textAnchor="end"
            height={56}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={CHART_AXIS_TICK_PROPS_SM}
            tickFormatter={(v: number) => v.toLocaleString()}
            label={Y_LABEL}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { label?: string } | undefined;
              return row?.label ?? '';
            }}
            formatter={(value) => {
              const count = typeof value === 'number' ? value : Number(value ?? 0);
              return [count.toLocaleString(), 'Enquiries'];
            }}
          />
          <Area
            type="monotone"
            dataKey="enquiries"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#call-volume-gradient)"
            dot={{ r: 3.5, fill: 'var(--primary)', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

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
