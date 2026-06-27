import { useEffect, useRef, useState } from 'react';

import { getHighlighter, highlightCode } from 'lib/shiki';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      setHtml(highlightCode(hl, code, language, isDark));
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, isDark]);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {html ? (
        <div
          className="[&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0 [&>pre]:p-4 [&>pre]:overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
