import mermaid from 'mermaid';
import { useEffect, useId, useRef, useState } from 'react';

interface MermaidBlockProps {
  code: string;
}

const MERMAID_COLORS = {
  nodeFill: '#dbeafe',
  nodeStroke: '#2563eb',
  nodeText: '#0f172a',
  edgeText: '#1e3a8a',
  line: '#64748b',
  actorFill: '#dbeafe',
  actorStroke: '#2563eb',
  nodeLabelFontSize: '13px',
  edgeLabelFontSize: '13px',
} as const;

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
      primaryColor: MERMAID_COLORS.nodeFill,
      primaryBorderColor: MERMAID_COLORS.nodeStroke,
      primaryTextColor: MERMAID_COLORS.nodeText,
      secondaryColor: '#ccfbf1',
      secondaryBorderColor: '#0f766e',
      secondaryTextColor: MERMAID_COLORS.nodeText,
      tertiaryColor: '#fef3c7',
      tertiaryBorderColor: '#d97706',
      tertiaryTextColor: MERMAID_COLORS.nodeText,
      lineColor: MERMAID_COLORS.line,
      textColor: MERMAID_COLORS.nodeText,
      mainBkg: '#ffffff',
      nodeBorder: MERMAID_COLORS.nodeStroke,
      clusterBkg: '#f8fafc',
      clusterBorder: '#cbd5e1',
      actorBkg: MERMAID_COLORS.actorFill,
      actorBorder: MERMAID_COLORS.actorStroke,
      actorTextColor: MERMAID_COLORS.nodeText,
      actorLineColor: MERMAID_COLORS.line,
      signalColor: MERMAID_COLORS.line,
      signalTextColor: MERMAID_COLORS.edgeText,
      labelBoxBkgColor: '#ffffff',
      labelBoxBorderColor: '#94a3b8',
      labelTextColor: MERMAID_COLORS.edgeText,
      loopTextColor: MERMAID_COLORS.nodeText,
      activationBkgColor: '#e0f2fe',
      activationBorderColor: '#0284c7',
      noteBkgColor: '#fef3c7',
      noteBorderColor: '#d97706',
      noteTextColor: MERMAID_COLORS.nodeText,
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
        fill: ${MERMAID_COLORS.nodeFill} !important;
        stroke: ${MERMAID_COLORS.nodeStroke} !important;
        stroke-width: 1.5px !important;
      }

      .node .label,
      .nodeLabel,
      .label,
      .loopText,
      .labelText,
      text {
        color: ${MERMAID_COLORS.nodeText} !important;
        fill: ${MERMAID_COLORS.nodeText} !important;
        font-weight: 500 !important;
      }

      foreignObject {
        overflow: visible !important;
      }

      foreignObject > div,
      foreignObject span,
      foreignObject p {
        overflow: visible !important;
        text-align: center !important;
      }

      .node foreignObject > div {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 100% !important;
      }

      .node foreignObject span,
      .node foreignObject p {
        color: ${MERMAID_COLORS.nodeText} !important;
        font-size: ${MERMAID_COLORS.nodeLabelFontSize} !important;
      }

      .edgeLabel,
      .edgeLabel p,
      .messageText {
        color: ${MERMAID_COLORS.edgeText} !important;
        fill: ${MERMAID_COLORS.edgeText} !important;
        font-size: ${MERMAID_COLORS.edgeLabelFontSize} !important;
        font-weight: 500 !important;
      }

      .edgePath path,
      .flowchart-link,
      .messageLine0,
      .messageLine1,
      .actor-line,
      .loopLine {
        stroke: ${MERMAID_COLORS.line} !important;
        stroke-width: 1.4px !important;
      }

      marker path {
        fill: ${MERMAID_COLORS.line} !important;
        stroke: ${MERMAID_COLORS.line} !important;
      }

      .actor,
      .actor-man line,
      .actor-man circle {
        fill: ${MERMAID_COLORS.actorFill} !important;
        stroke: ${MERMAID_COLORS.actorStroke} !important;
      }

      .actor > rect,
      .sequenceNumber {
        fill: ${MERMAID_COLORS.actorFill} !important;
        stroke: ${MERMAID_COLORS.actorStroke} !important;
      }

      .actor > text,
      .actor tspan {
        fill: ${MERMAID_COLORS.nodeText} !important;
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
        if (cancelled) return undefined;
        setSvg(appendDiagramStyles(rendered));
        return undefined;
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
