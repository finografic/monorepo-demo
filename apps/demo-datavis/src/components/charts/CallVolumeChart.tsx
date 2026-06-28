import { CALL_VOLUME_DATA } from 'data/call-volume';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CHART_ID = 'call-volume-chart-title';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function CallVolumeChart() {
  return (
    <div role="img" aria-labelledby={CHART_ID} className="w-full">
      <h3 id={CHART_ID} className="sr-only">
        Area chart: daily registration call centre enquiries for May 2026, showing weekday peaks around
        1800–2300 calls and weekend lows around 400
      </h3>

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart
          data={CALL_VOLUME_DATA}
          margin={{ top: 8, right: 24, left: 0, bottom: 40 }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="callVolumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            angle={-30}
            textAnchor="end"
            height={50}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickFormatter={(v: number) => v.toLocaleString()}
            label={{
              value: 'Enquiries',
              angle: -90,
              position: 'insideLeft',
              offset: 14,
              style: { fontSize: 11, fill: 'var(--muted-foreground)' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: 13,
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Enquiries']}
            labelFormatter={formatDate}
          />
          <Area
            type="monotone"
            dataKey="enquiries"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#callVolumeGradient)"
            dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
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
