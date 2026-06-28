import { useEffect, useRef, useState } from 'react';

interface CkanDataset {
  id: string;
  title: string;
  notes: string;
  metadata_modified: string;
  num_resources: number;
  tags: Array<{ name: string }>;
}

interface CkanResponse {
  success: boolean;
  result: {
    count: number;
    results: CkanDataset[];
  };
}

const CKAN_URL =
  'https://data.qld.gov.au/api/3/action/package_search?fq=organization:transport-and-main-roads&sort=metadata_modified+desc&rows=10';

const CHART_ID = 'live-catalogue-title';

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}

export function LiveCatalogue() {
  const [data, setData] = useState<CkanDataset[] | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    fetch(CKAN_URL, { signal: ac.signal, mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CkanResponse>;
      })
      .then((json) => {
        if (!json.success) throw new Error('CKAN returned success: false');
        setData(json.result.results);
        setCount(json.result.count);
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
    <div role="region" aria-labelledby={CHART_ID} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <h3 id={CHART_ID} className="sr-only">
          Live dataset catalogue from Queensland Open Data CKAN API
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          Live
        </span>
        {!loading && !error && (
          <span className="text-xs text-muted-foreground">
            {count.toLocaleString()} TMR datasets on data.qld.gov.au — showing 10 most recently updated
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary/70" />
          <span className="sr-only">Loading live data from Queensland Open Data…</span>
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
            This may be a CORS or network issue in this environment. In production, route the API call through
            a server proxy. The endpoint is: <code className="text-xs bg-muted px-1 rounded">{CKAN_URL}</code>
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="space-y-2" aria-label="Dataset list">
            {data.map((ds) => (
              <article
                key={ds.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 hover:bg-card transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ds.title}</p>
                  {ds.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {ds.notes.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {ds.tags.slice(0, 3).map((t) => (
                      <span
                        key={t.name}
                        className="inline-block rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-none text-right space-y-1">
                  <p className="text-xs font-semibold text-primary tabular-nums">
                    {ds.num_resources} resource{ds.num_resources !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatRelative(ds.metadata_modified)}</p>
                </div>
              </article>
            ))}
          </div>

          <table className="sr-only">
            <caption>Live TMR datasets from Queensland Open Data</caption>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Resources</th>
                <th scope="col">Last modified</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ds) => (
                <tr key={ds.id}>
                  <td>{ds.title}</td>
                  <td>{ds.num_resources}</td>
                  <td>{ds.metadata_modified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
