import { Button } from '@workspace/ui/components/button';
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
  const isPlainText = language === '' || language === 'text';
  const isCompactToken = isPlainText && !code.includes('\n') && code.length <= 48;

  useEffect(() => {
    if (isCompactToken) {
      setHtml(null);
      return;
    }

    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return undefined;
      setHtml(highlightCode(hl, code, language, isDark));
      return undefined;
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, isDark, isCompactToken]);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
      return undefined;
    });
  }

  if (isCompactToken) {
    return (
      <code className="inline-flex max-w-full rounded-md border border-border/70 bg-muted/60 px-2 py-1 font-mono text-[0.82rem] font-medium leading-none text-foreground/85">
        {code}
      </code>
    );
  }

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || 'text'}</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
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
