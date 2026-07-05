import { useEffect, useRef, useState } from 'react';

export type LiveDataProgressPhase = 'requesting' | 'receiving' | 'parsing' | 'rendering';

interface LiveDataProgressProps {
  phase: LiveDataProgressPhase;
  detail: string;
}

const PHASE_META: Record<LiveDataProgressPhase, { label: string; floor: number; ceiling: number }> = {
  requesting: { label: 'Requesting live data', floor: 10, ceiling: 28 },
  receiving: { label: 'Receiving API response', floor: 36, ceiling: 58 },
  parsing: { label: 'Parsing records', floor: 66, ceiling: 82 },
  rendering: { label: 'Rendering chart', floor: 90, ceiling: 96 },
};

export function LiveDataProgress({ phase, detail }: LiveDataProgressProps) {
  const [percent, setPercent] = useState(PHASE_META[phase].floor);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setPercent((current) => Math.max(current, PHASE_META[phase].floor));
  }, [phase]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const meta = PHASE_META[phase];
      setElapsedMs(Date.now() - startTimeRef.current);
      setPercent((current) => Math.min(meta.ceiling, current + 0.45));
    }, 250);

    return () => window.clearInterval(timer);
  }, [phase]);

  const meta = PHASE_META[phase];

  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-20 text-center"
      role="status"
      aria-live="polite"
    >
      <span
        className="block h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <span
          className="block h-full rounded-full bg-primary/70 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-sm font-semibold text-primary">{meta.label}</span>
      <span className="text-xs text-muted-foreground">
        {detail} · {(elapsedMs / 1000).toFixed(1)}s
      </span>
    </div>
  );
}
