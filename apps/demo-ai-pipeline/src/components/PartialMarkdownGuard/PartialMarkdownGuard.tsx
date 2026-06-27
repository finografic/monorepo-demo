import { MarkdownRenderer } from 'components/MarkdownRenderer/MarkdownRenderer';

import { splitAtUnclosedFence } from 'lib/stream-buffer';

interface PartialMarkdownGuardProps {
  buffer: string;
  showRaw: boolean;
}

export function PartialMarkdownGuard({ buffer, showRaw }: PartialMarkdownGuardProps) {
  if (showRaw) {
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm text-foreground/80 bg-muted rounded-lg p-4 overflow-x-auto">
        {buffer || <span className="text-muted-foreground italic">Waiting for content…</span>}
      </pre>
    );
  }

  if (!buffer) {
    return (
      <div className="text-muted-foreground text-sm italic">Select a prompt and click Generate to begin.</div>
    );
  }

  const { safe, pending } = splitAtUnclosedFence(buffer);

  return (
    <>
      <MarkdownRenderer content={safe} />
      {pending && (
        <div
          aria-hidden="true"
          className="mt-2 font-mono text-xs text-muted-foreground/50 bg-muted/50 rounded p-3 whitespace-pre-wrap border border-dashed border-border"
        >
          <span className="block text-muted-foreground/40 mb-1 not-italic text-[10px] uppercase tracking-wider">
            rendering…
          </span>
          {pending}
        </div>
      )}
    </>
  );
}
