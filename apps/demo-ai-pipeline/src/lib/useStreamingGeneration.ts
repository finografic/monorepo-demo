import type { GenerationStatus, MetricsData, StreamChunk, StreamMode } from '@workspace/shared';
import { useCallback, useRef, useState } from 'react';

interface CachedGeneration {
  buffer: string;
  metrics: MetricsData | null;
}

export interface UseStreamingGenerationReturn {
  status: GenerationStatus;
  buffer: string;
  metrics: MetricsData | null;
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

  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const firstChunkTimeRef = useRef<number>(0);
  const cacheRef = useRef<Map<string, CachedGeneration>>(new Map());
  const currentCacheKeyRef = useRef<string | null>(null);
  const bufferRef = useRef('');
  const metricsRef = useRef<MetricsData | null>(null);

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
    if (currentCacheKeyRef.current && bufferRef.current) {
      cacheRef.current.set(currentCacheKeyRef.current, {
        buffer: bufferRef.current,
        metrics: metricsRef.current,
      });
    }
    setStatus((prev) => (prev === 'streaming' ? 'complete' : prev));
  }, []);

  const clear = useCallback(
    (cacheKey?: string) => {
      abortRef.current?.abort();
      if (cacheKey) {
        cacheRef.current.delete(cacheKey);
      }
      setStatus('idle');
      setBufferValue('');
      setMetricsValue(null);
    },
    [setBufferValue, setMetricsValue],
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
        return;
      }

      setStatus('complete');
      setBufferValue(cached.buffer);
      setMetricsValue(cached.metrics);
    },
    [setBufferValue, setMetricsValue],
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
      let generatedBuffer = '';

      (async () => {
        try {
          const response =
            mode === 'live'
              ? await fetch('/api/stream/live', {
                  method: 'POST',
                  signal: controller.signal,
                  headers: { 'Accept': 'text/event-stream', 'Content-Type': 'application/json' },
                  body: JSON.stringify({ promptId, systemPrompt, modelId }),
                })
              : await fetch(`/api/stream/fixture/${promptId}`, {
                  signal: controller.signal,
                  headers: { Accept: 'text/event-stream' },
                });

          if (!response.ok || !response.body) {
            throw new Error(`Stream failed: ${response.status}`);
          }

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
              } else if (event.type === 'done' && event.metrics) {
                cacheRef.current.set(cacheKey, {
                  buffer: generatedBuffer,
                  metrics: event.metrics,
                });
                setMetricsValue(event.metrics);
                setStatus('complete');
              } else if (event.type === 'error') {
                setStatus('error');
              }
            }
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          console.error('[stream]', err);
          setStatus('error');
        }
      })();
    },
    [setBufferValue, setMetricsValue],
  );

  return { status, buffer, metrics, start, stop, clear, restore };
}
