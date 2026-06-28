import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import { useEffect, useId, useRef, useState } from 'react';

interface MermaidBlockProps {
  code: string;
}

let mermaidInitialised = false;

function ensureMermaid() {
  if (mermaidInitialised) return;
  mermaidInitialised = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    fontFamily: 'inherit',
    themeVariables: {
      primaryColor: '#dbeafe',
      primaryBorderColor: '#2563eb',
      primaryTextColor: '#0f172a',
      secondaryColor: '#ccfbf1',
      secondaryBorderColor: '#0f766e',
      secondaryTextColor: '#0f172a',
      tertiaryColor: '#fef3c7',
      tertiaryBorderColor: '#d97706',
      tertiaryTextColor: '#0f172a',
      lineColor: '#64748b',
      textColor: '#0f172a',
      mainBkg: '#ffffff',
      nodeBorder: '#2563eb',
      clusterBkg: '#f8fafc',
      clusterBorder: '#cbd5e1',
      actorBkg: '#dbeafe',
      actorBorder: '#2563eb',
      actorTextColor: '#0f172a',
      actorLineColor: '#64748b',
      signalColor: '#475569',
      signalTextColor: '#334155',
      labelBoxBkgColor: '#ffffff',
      labelBoxBorderColor: '#94a3b8',
      labelTextColor: '#0f172a',
      loopTextColor: '#0f172a',
      activationBkgColor: '#e0f2fe',
      activationBorderColor: '#0284c7',
      noteBkgColor: '#fef3c7',
      noteBorderColor: '#d97706',
      noteTextColor: '#0f172a',
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: false,
      padding: 20,
    },
    sequence: {
      useMaxWidth: true,
    },
  });
}

function appendDiagramStyles(svg: string): string {
  const styles = `
    <style>
      .node rect,
      .node polygon,
      .node circle,
      .node ellipse,
      .node path {
        fill: #dbeafe !important;
        stroke: #2563eb !important;
        stroke-width: 1.5px !important;
      }

      .node .label,
      .nodeLabel,
      .label,
      .edgeLabel,
      .edgeLabel p,
      .messageText,
      .loopText,
      .labelText,
      text {
        color: #0f172a !important;
        fill: #0f172a !important;
        font-weight: 500 !important;
      }

      .edgePath path,
      .flowchart-link,
      .messageLine0,
      .messageLine1,
      .actor-line,
      .loopLine {
        stroke: #64748b !important;
        stroke-width: 1.4px !important;
      }

      marker path {
        fill: #64748b !important;
        stroke: #64748b !important;
      }

      .actor,
      .actor-man line,
      .actor-man circle {
        fill: #dbeafe !important;
        stroke: #2563eb !important;
      }

      .actor > rect,
      .sequenceNumber {
        fill: #dbeafe !important;
        stroke: #2563eb !important;
      }

      .actor > text,
      .actor tspan {
        fill: #0f172a !important;
      }
    </style>
  `;

  return svg.replace(/<svg([^>]*)>/, `<svg$1>${styles}`);
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const id = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureMermaid();
    let cancelled = false;

    mermaid
      .render(`mermaid_${id}`, code)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(
            DOMPurify.sanitize(appendDiagramStyles(rendered), {
              USE_PROFILES: { svg: true, svgFilters: true },
              // style: preserve Mermaid's inline max-width on the root <svg> so diagrams
              // are not stretched beyond their natural size by the w-full container
              ADD_ATTR: ['style', 'class', 'xmlns'],
              ADD_TAGS: ['style'],
            }),
          );
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Diagram render error');
      });

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
        <p className="font-medium">Diagram error</p>
        <pre className="mt-1 text-xs opacity-75 whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Mermaid diagram"
      className="my-4 overflow-auto rounded-lg border border-border bg-card p-4 max-h-[70vh]"
    >
      {svg ? (
        <div
          dangerouslySetInnerHTML={{ __html: svg }}
          className="flex justify-center w-full [&_svg]:max-w-full [&_svg]:h-auto"
        />
      ) : (
        <div className="h-24 flex items-center text-muted-foreground text-sm animate-pulse">
          Rendering diagram…
        </div>
      )}
    </div>
  );
}
