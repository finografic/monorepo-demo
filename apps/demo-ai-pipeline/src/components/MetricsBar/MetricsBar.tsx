import type { GenerationStatus, LlmProviderId, MetricsData } from '@workspace/shared';

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
        className="flex items-center gap-4 text-xs text-muted-foreground"
      >
        <span className="inline-block h-1.5 w-24 rounded-full bg-muted overflow-hidden">
          <span className="block h-full w-1/2 bg-primary/50 animate-pulse rounded-full" />
        </span>
        <span className="animate-pulse">Streaming…</span>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      aria-label="Generation metrics"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
    >
      <Stat label="Tokens" value={String(metrics.tokens)} />
      <Stat label="First token" value={`${metrics.timeToFirstToken} ms`} />
      <Stat label="Total time" value={`${metrics.totalTime} ms`} />
      <Stat label="Model" value={metrics.model} />
      {metrics.estimatedCostUsd ? (
        <Stat label="Est. cost" value={`$${metrics.estimatedCostUsd.toFixed(6)}`} />
      ) : null}
      {metrics.reasoningTokens ? <Stat label="Reasoning" value={String(metrics.reasoningTokens)} /> : null}
      <ProviderBadge provider={metrics.provider} />
    </div>
  );
}

const PROVIDER_LABELS: Record<LlmProviderId, string> = {
  'fixture': 'fixture',
  'lmstudio': 'LM Studio',
  'opencode-go': 'OpenCode Go',
};

function ProviderBadge({ provider }: { provider: LlmProviderId }) {
  return (
    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground/70 text-[10px] uppercase tracking-wider">
      {PROVIDER_LABELS[provider]}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-muted-foreground/60">{label}:</span>{' '}
      <span className="font-medium text-foreground/80">{value}</span>
    </span>
  );
}
