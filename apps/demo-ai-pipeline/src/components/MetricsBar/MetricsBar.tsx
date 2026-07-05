import type { GenerationStatus, MetricsData } from '@workspace/shared';

import type { StreamingProgress } from 'lib/useStreamingGeneration';

interface MetricsBarProps {
  status: GenerationStatus;
  metrics: MetricsData | null;
  progress: StreamingProgress;
}

export function MetricsBar({ status, metrics, progress }: MetricsBarProps) {
  if (status === 'idle') return null;

  if (status === 'streaming' || !metrics) {
    const elapsedSeconds = Math.max(0, progress.elapsedMs / 1000);

    return (
      <div
        aria-live="polite"
        aria-label="Generation in progress"
        className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
      >
        <span
          className="inline-block h-2 w-36 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.percent)}
        >
          <span
            className="block h-full rounded-full bg-primary/70 transition-all duration-300 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </span>
        <span className="font-semibold text-primary">{progress.label}</span>
        <span className="text-xs text-muted-foreground/80">
          {progress.tokenEstimate > 0 ? `${progress.tokenEstimate} est. tokens · ` : null}
          {elapsedSeconds.toFixed(1)}s
        </span>
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
