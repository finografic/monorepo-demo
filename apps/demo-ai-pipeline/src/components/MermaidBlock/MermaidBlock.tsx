import { styles as stylesMermaid } from 'components/MermaidBlock/mermaid.styles';
import { MERMAID_THEME } from 'components/MermaidBlock/mermaid.theme';
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
    themeVariables: { ...MERMAID_THEME },
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

function appendDiagramStyles(svg: string, styles: string): string {
  return svg.replace(/<svg([^>]*)>/, `<svg$1 aria-hidden="true" focusable="false">${styles}`);
}

function getDiagramLabel(code: string): string {
  const firstLine = code.trimStart().split('\n')[0]?.toLowerCase() ?? '';

  if (firstLine.startsWith('sequencediagram')) return 'Mermaid sequence diagram';
  if (firstLine.startsWith('flowchart')) return 'Mermaid flowchart diagram';
  if (firstLine.startsWith('graph')) return 'Mermaid graph diagram';

  return 'Mermaid diagram';
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const id = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramLabel = getDiagramLabel(code);

  useEffect(() => {
    ensureMermaid();
    let cancelled = false;

    mermaid
      .render(`mermaid_${id}`, code)
      .then(({ svg: rendered }) => {
        if (cancelled) return undefined;
        setSvg(appendDiagramStyles(rendered, stylesMermaid));
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
      aria-label={diagramLabel}
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
