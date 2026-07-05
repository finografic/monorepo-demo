import type { GenerationStatus, MetricsData, StreamChunk, StreamMode } from '@workspace/shared';
import { useCallback, useRef, useState } from 'react';

interface CachedGeneration {
  buffer: string;
  metrics: MetricsData | null;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

type StreamingPhase = 'idle' | 'requesting' | 'connected' | 'streaming' | 'finalizing' | 'complete' | 'error';

export interface StreamingProgress {
  phase: StreamingPhase;
  label: string;
  percent: number;
  elapsedMs: number;
  tokenEstimate: number;
}

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export interface UseStreamingGenerationReturn {
  status: GenerationStatus;
  buffer: string;
  metrics: MetricsData | null;
  progress: StreamingProgress;
  start: (
    cacheKey: string,
    promptId: string,
    mode: StreamMode,
    systemPrompt: string,
    modelId?: string,
  ) => void;
  stop: () => void;
  clear: (cacheKey?: string) => void;
  restore: (cacheKey: string) => void;
}

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [buffer, setBuffer] = useState('');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [progress, setProgress] = useState<StreamingProgress>({
    phase: 'idle',
    label: 'Ready',
    percent: 0,
    elapsedMs: 0,
    tokenEstimate: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const firstChunkTimeRef = useRef<number>(0);
  const progressTimerRef = useRef<number | null>(null);
  const progressRef = useRef(progress);
  const cacheRef = useRef<Map<string, CachedGeneration>>(new Map());
  const currentCacheKeyRef = useRef<string | null>(null);
  const bufferRef = useRef('');
  const metricsRef = useRef<MetricsData | null>(null);

  const setProgressValue = useCallback((nextProgress: StreamingProgress) => {
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  const updateProgress = useCallback((patch: Partial<StreamingProgress>) => {
    const nextProgress = { ...progressRef.current, ...patch };
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current === null) return;
    window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      const { current } = progressRef;
      if (current.phase === 'idle' || current.phase === 'complete' || current.phase === 'error') return;

      const elapsedMs = Date.now() - startTimeRef.current;
      const nextPercent =
        current.phase === 'requesting'
          ? Math.min(16, current.percent + 0.5)
          : current.phase === 'connected'
            ? Math.min(32, current.percent + 0.35)
            : current.phase === 'streaming'
              ? Math.min(88, current.percent + 0.2)
              : Math.min(96, current.percent + 0.45);

      setProgressValue({ ...current, elapsedMs, percent: nextPercent });
    }, 250);
  }, [setProgressValue, stopProgressTimer]);

  const setBufferValue = useCallback((nextBuffer: string) => {
    bufferRef.current = nextBuffer;
    setBuffer(nextBuffer);
  }, []);

  const setMetricsValue = useCallback((nextMetrics: MetricsData | null) => {
    metricsRef.current = nextMetrics;
    setMetrics(nextMetrics);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    stopProgressTimer();
    if (currentCacheKeyRef.current && bufferRef.current) {
      cacheRef.current.set(currentCacheKeyRef.current, {
        buffer: bufferRef.current,
        metrics: metricsRef.current,
      });
    }
    setStatus((prev) => (prev === 'streaming' ? 'complete' : prev));
    updateProgress({
      phase: 'complete',
      label: bufferRef.current ? 'Stopped' : 'Ready',
      percent: bufferRef.current ? progressRef.current.percent : 0,
    });
  }, [stopProgressTimer, updateProgress]);

  const clear = useCallback(
    (cacheKey?: string) => {
      abortRef.current?.abort();
      if (cacheKey) {
        cacheRef.current.delete(cacheKey);
      }
      setStatus('idle');
      setBufferValue('');
      setMetricsValue(null);
      stopProgressTimer();
      setProgressValue({
        phase: 'idle',
        label: 'Ready',
        percent: 0,
        elapsedMs: 0,
        tokenEstimate: 0,
      });
    },
    [setBufferValue, setMetricsValue, setProgressValue, stopProgressTimer],
  );

  const restore = useCallback(
    (cacheKey: string) => {
      abortRef.current?.abort();
      currentCacheKeyRef.current = cacheKey;

      const cached = cacheRef.current.get(cacheKey);
      if (!cached) {
        setStatus('idle');
        setBufferValue('');
        setMetricsValue(null);
        setProgressValue({
          phase: 'idle',
          label: 'Ready',
          percent: 0,
          elapsedMs: 0,
          tokenEstimate: 0,
        });
        return;
      }

      setStatus('complete');
      setBufferValue(cached.buffer);
      setMetricsValue(cached.metrics);
      setProgressValue({
        phase: 'complete',
        label: 'Cached result restored',
        percent: 100,
        elapsedMs: cached.metrics?.totalTime ?? 0,
        tokenEstimate: cached.metrics?.tokens ?? Math.ceil(cached.buffer.length / 4),
      });
    },
    [setBufferValue, setMetricsValue, setProgressValue],
  );

  const start = useCallback(
    (cacheKey: string, promptId: string, mode: StreamMode, systemPrompt: string, modelId?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      currentCacheKeyRef.current = cacheKey;
      cacheRef.current.delete(cacheKey);

      setStatus('streaming');
      setBufferValue('');
      setMetricsValue(null);
      startTimeRef.current = Date.now();
      firstChunkTimeRef.current = 0;
      setProgressValue({
        phase: 'requesting',
        label: mode === 'live' ? 'Sending prompt to model' : 'Loading mock fixture',
        percent: 8,
        elapsedMs: 0,
        tokenEstimate: 0,
      });
      startProgressTimer();
      let generatedBuffer = '';

      (async () => {
        try {
          const response =
            mode === 'live'
              ? await fetch(apiUrl('/api/stream/live'), {
                  method: 'POST',
                  signal: controller.signal,
                  headers: { 'Accept': 'text/event-stream', 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ promptId, systemPrompt, modelId }),
                })
              : await fetch(apiUrl(`/api/stream/fixture/${promptId}`), {
                  signal: controller.signal,
                  headers: { Accept: 'text/event-stream' },
                });

          if (!response.ok || !response.body) {
            throw new Error(`Stream failed: ${response.status}`);
          }

          updateProgress({
            phase: 'connected',
            label: mode === 'live' ? 'Connected; waiting for first token' : 'Fixture stream connected',
            percent: Math.max(progressRef.current.percent, 18),
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let remainder = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = remainder + decoder.decode(value, { stream: true });
            const lines = text.split('\n');
            remainder = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (!payload) continue;

              const event: StreamChunk = JSON.parse(payload);

              if (event.type === 'delta' && event.text) {
                if (!firstChunkTimeRef.current) {
                  firstChunkTimeRef.current = Date.now();
                }
                generatedBuffer += event.text;
                setBufferValue(generatedBuffer);
                updateProgress({
                  phase: 'streaming',
                  label: 'Receiving markdown',
                  percent: Math.min(
                    88,
                    Math.max(progressRef.current.percent, 34 + Math.log10(generatedBuffer.length + 1) * 12),
                  ),
                  elapsedMs: Date.now() - startTimeRef.current,
                  tokenEstimate: Math.ceil(generatedBuffer.length / 4),
                });
              } else if (event.type === 'done' && event.metrics) {
                updateProgress({
                  phase: 'finalizing',
                  label: 'Finalizing metrics',
                  percent: 96,
                  elapsedMs: Date.now() - startTimeRef.current,
                  tokenEstimate: event.metrics.tokens,
                });
                cacheRef.current.set(cacheKey, {
                  buffer: generatedBuffer,
                  metrics: event.metrics,
                });
                setMetricsValue(event.metrics);
                stopProgressTimer();
                setProgressValue({
                  phase: 'complete',
                  label: 'Complete',
                  percent: 100,
                  elapsedMs: event.metrics.totalTime,
                  tokenEstimate: event.metrics.tokens,
                });
                setStatus('complete');
              } else if (event.type === 'error') {
                stopProgressTimer();
                updateProgress({
                  phase: 'error',
                  label: event.message ?? 'Generation failed',
                  elapsedMs: Date.now() - startTimeRef.current,
                });
                setStatus('error');
              }
            }
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error('[stream]', err);
          stopProgressTimer();
          updateProgress({
            phase: 'error',
            label: err instanceof Error ? err.message : 'Generation failed',
            elapsedMs: Date.now() - startTimeRef.current,
          });
          setStatus('error');
        }
      })();
    },
    [
      setBufferValue,
      setMetricsValue,
      setProgressValue,
      startProgressTimer,
      stopProgressTimer,
      updateProgress,
    ],
  );

  return { status, buffer, metrics, progress, start, stop, clear, restore };
}
