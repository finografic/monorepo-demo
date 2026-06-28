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
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'inherit',
    flowchart: {
      useMaxWidth: true,
      // TODO: htmlLabels:true makes Mermaid render labels via <foreignObject> (HTML inside SVG),
      // which DOMPurify strips even when ADD_TAGS includes foreignObject — labels render empty.
      // Root cause not fully resolved: securityLevel:'strict' may conflict with foreignObject injection.
      // Options to investigate: securityLevel:'loose' (less safe), skip DOMPurify on flowcharts,
      // or use a post-render DOM manipulation approach instead of dangerouslySetInnerHTML.
      // See: docs/markdown-rendering-styles.md § Diagrams
      // htmlLabels: true,
      padding: 20,
    },
    sequence: {
      useMaxWidth: true,
    },
  });
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
        if (!cancelled)
          {setSvg(
            DOMPurify.sanitize(rendered, {
              USE_PROFILES: { svg: true, svgFilters: true },
              // style: preserve Mermaid's inline max-width on the root <svg> so diagrams
              // are not stretched beyond their natural size by the w-full container
              ADD_ATTR: ['style', 'class', 'xmlns'],
              // TODO (htmlLabels): when htmlLabels:true is re-enabled, Mermaid renders labels
              // via <foreignObject> (HTML inside SVG). DOMPurify strips these even with:
              //   ADD_TAGS: ['foreignObject', 'div', 'span', 'p', 'b', 'i', 'br'],
              //   ADD_ATTR: [..., 'requiredExtensions'],
              // Root cause: securityLevel:'strict' likely conflicts with foreignObject injection.
              // Options: securityLevel:'loose' (less safe), post-render DOM patching, or skip
              // DOMPurify on the flowchart SVG and rely solely on Mermaid's own strict-mode sanitisation.
              // See: docs/markdown-rendering-styles.md § Diagrams (Open Issues)
            }),
          );}
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
