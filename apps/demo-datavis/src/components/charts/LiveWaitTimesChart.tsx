import { useEffect, useRef, useState } from 'react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import {
  CHART_AXIS_TICK_PROPS_SM,
  CHART_GRID_DASH,
  CHART_GRID_STROKE,
  TOOLTIP_STYLE,
  chartXAxisLabelBottom,
  chartYAxisLabelLeft,
} from 'constants/charts.config';

const RESOURCE_ID = '421312d3-dcc7-4d20-aa01-46acea49c347';
const DATASTORE_URL = `https://www.data.qld.gov.au/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&sort=_id+desc&limit=300`;

const CHART_ID = 'live-wait-times-title';
const X_LABEL = chartXAxisLabelBottom('Avg wait time (minutes)');
const Y_LABEL = chartYAxisLabelLeft('Customers served', 12);

interface RawRecord {
  _id: number;
  Date: string;
  CSC_NAME: string;
  NUMBER_OF_CUSTOMERS: string;
  AVG_WAIT_TIME: string;
}

interface DatastoreResponse {
  success: boolean;
  result: { records: RawRecord[] };
}

interface CscRow {
  name: string;
  waitMin: number;
  customers: number;
  t: number; // normalised customers 0–1, for dot size/opacity
}

function ScatterDot({ cx = 0, cy = 0, payload }: { cx?: number; cy?: number; payload?: CscRow }) {
  if (!payload) return null;
  const r = 5 + payload.t * 10;
  const opacity = 0.4 + payload.t * 0.55;
  return <circle cx={cx} cy={cy} r={r} fill="var(--primary)" fillOpacity={opacity} />;
}

function parseMinutes(hms: string): number {
  const parts = hms.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0) + (parts[2] ?? 0) / 60;
}

function shortName(raw: string): string {
  return raw.replace(' CSC', '').replace(' QGAP', '').replace(' Service Centre', '');
}

function ScatterTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as CscRow | undefined;
  if (!d) return null;
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2 rounded-md shadow text-sm">
      <p className="font-semibold text-foreground mb-1">{d.name}</p>
      <p className="text-muted-foreground">
        Wait: <span className="text-foreground font-medium">{d.waitMin.toFixed(1)} min</span>
      </p>
      <p className="text-muted-foreground">
        Customers: <span className="text-foreground font-medium">{d.customers.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function LiveWaitTimesChart() {
  const [rows, setRows] = useState<CscRow[] | null>(null);
  const [asOf, setAsOf] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    fetch(DATASTORE_URL, { signal: ac.signal, mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DatastoreResponse>;
      })
      .then((json) => {
        if (!json.success) throw new Error('DataStore returned success: false');

        const { records } = json.result;

        const byDate = new Map<string, RawRecord[]>();
        for (const r of records) {
          const list = byDate.get(r.Date) ?? [];
          list.push(r);
          byDate.set(r.Date, list);
        }
        const latestDate = [...byDate.keys()].toSorted().at(-1) ?? '';
        const latestRecords = byDate.get(latestDate) ?? [];

        const raw = latestRecords
          .map((r) => ({
            name: shortName(r.CSC_NAME),
            waitMin: parseMinutes(r.AVG_WAIT_TIME),
            customers: Number(r.NUMBER_OF_CUSTOMERS),
          }))
          .filter((r) => r.waitMin > 0.5 && r.customers > 0);

        const maxCustomers = Math.max(...raw.map((r) => r.customers));
        const parsed: CscRow[] = raw.map((r) =>
          Object.assign(r, { t: maxCustomers > 0 ? r.customers / maxCustomers : 0 }),
        );

        setRows(parsed);
        setAsOf(latestDate);
        setLoading(false);
        return undefined;
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => ac.abort();
  }, []);

  return (
    <div
      role="region"
      aria-labelledby={CHART_ID}
      className="w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      tabIndex={0}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 id={CHART_ID} className="sr-only">
          Live scatter plot: QLD transport service centres plotted by average wait time (x-axis) versus number
          of customers served (y-axis). Reveals whether busier centres also have longer waits.
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          Live
        </span>
        {!loading && !error && asOf && (
          <span className="text-xs text-muted-foreground">
            Most recent data: <span className="font-medium text-foreground">{asOf}</span> — wait time vs
            customer volume per centre
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary/70" />
          <span className="sr-only">Fetching live wait time data from QLD DataStore…</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <p className="font-medium mb-1">Could not reach Queensland Open Data</p>
          <p className="text-destructive/80 text-xs mb-2">{error}</p>
          <p className="text-xs text-muted-foreground">
            Endpoint: <code className="text-xs bg-muted px-1 rounded break-all">{DATASTORE_URL}</code>
          </p>
        </div>
      )}

      {rows && (
        <>
          <div role="img" aria-label="Scatter plot of live service centre wait time vs customer volume">
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 8, right: 32, bottom: 40, left: 16 }} aria-hidden="true">
                <CartesianGrid strokeDasharray={CHART_GRID_DASH} stroke={CHART_GRID_STROKE} />
                <XAxis
                  type="number"
                  dataKey="waitMin"
                  name="Avg wait"
                  tick={CHART_AXIS_TICK_PROPS_SM}
                  tickFormatter={(v: number) => `${v.toFixed(0)}m`}
                  label={X_LABEL}
                />
                <YAxis
                  type="number"
                  dataKey="customers"
                  name="Customers"
                  tick={CHART_AXIS_TICK_PROPS_SM}
                  tickFormatter={(v: number) => v.toLocaleString()}
                  label={Y_LABEL}
                />
                <Tooltip content={ScatterTooltip} />
                <Scatter data={rows} shape={<ScatterDot />} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <table className="sr-only">
            <caption>Live service centre wait times and customer volumes as of {asOf}</caption>
            <thead>
              <tr>
                <th scope="col">Centre</th>
                <th scope="col">Avg wait (min)</th>
                <th scope="col">Customers</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.waitMin.toFixed(1)}</td>
                  <td>{row.customers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
