import type { GenerationStatus, MetricsData, StreamChunk } from '@workspace/shared';
import { useCallback, useRef, useState } from 'react';

export interface UseStreamingGenerationReturn {
  status: GenerationStatus;
  buffer: string;
  metrics: MetricsData | null;
  start: (promptId: string) => void;
  stop: () => void;
  clear: () => void;
}

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [buffer, setBuffer] = useState('');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const firstChunkTimeRef = useRef<number>(0);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus((prev) => (prev === 'streaming' ? 'complete' : prev));
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setBuffer('');
    setMetrics(null);
  }, []);

  const start = useCallback((promptId: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('streaming');
    setBuffer('');
    setMetrics(null);
    startTimeRef.current = Date.now();
    firstChunkTimeRef.current = 0;

    (async () => {
      try {
        const response = await fetch(`/api/stream/fixture/${promptId}`, {
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
              setBuffer((prev) => prev + event.text);
            } else if (event.type === 'done' && event.metrics) {
              setMetrics(event.metrics);
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
  }, []);

  return { status, buffer, metrics, start, stop, clear };
}
