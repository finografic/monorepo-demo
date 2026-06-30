import type { GenerationStatus, MetricsData } from '@workspace/shared';

interface MetricsBarProps {
  status: GenerationStatus;
  metrics: MetricsData | null;
}

export function MetricsBar({ status, metrics }: MetricsBarProps) {
  if (status === 'idle') return null;

  if (status === 'streaming' || !metrics) {
    return (
      <div
        aria-live="polite"
        aria-label="Generation in progress"
        className="flex items-center gap-4 text-sm text-muted-foreground"
      >
        <span className="inline-block h-2 w-28 overflow-hidden rounded-full bg-muted">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-primary/50" />
        </span>
        <span className="animate-pulse">Streaming…</span>
      </div>
    );
  }

  const hasExtendedMetadata = Boolean(metrics.estimatedCostUsd || metrics.reasoningTokens);

  if (hasExtendedMetadata) {
    return (
      <div
        aria-live="polite"
        aria-label="Generation metrics"
        className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
      >
        <Stat label="Model" value={metrics.model} />
        {metrics.reasoningTokens ? <Stat label="Reasoning" value={String(metrics.reasoningTokens)} /> : null}
        <Stat label="Total time" value={`${metrics.totalTime} ms`} />
        <Stat label="Tokens" value={String(metrics.tokens)} />
        {metrics.estimatedCostUsd ? (
          <Stat label="Estimated cost" value={`$${metrics.estimatedCostUsd.toFixed(6)}`} />
        ) : null}
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      aria-label="Generation metrics"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
    >
      <Stat label="Model" value={metrics.mode === 'fixture' ? 'Mock fixture' : metrics.model} />
      <Stat label="Tokens" value={String(metrics.tokens)} />
      <Stat label="First token" value={`${metrics.timeToFirstToken} ms`} />
      <Stat label="Total time" value={`${metrics.totalTime} ms`} />
      {metrics.estimatedCostUsd ? (
        <Stat label="Est. cost" value={`$${metrics.estimatedCostUsd.toFixed(6)}`} />
      ) : null}
      {metrics.reasoningTokens ? <Stat label="Reasoning" value={String(metrics.reasoningTokens)} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="font-medium  text-foreground/90 mr-1">{label}:</span>{' '}
      <span className="font-bold text-primary">{value}</span>
    </span>
  );
}
