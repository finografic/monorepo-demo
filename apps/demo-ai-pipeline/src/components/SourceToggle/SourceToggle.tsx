interface SourceToggleProps {
  showRaw: boolean;
  onToggle: () => void;
}

export function SourceToggle({ showRaw, onToggle }: SourceToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={showRaw}
      aria-label={showRaw ? 'Switch to rendered view' : 'Switch to raw markdown view'}
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
    >
      <span
        className={`inline-flex items-center gap-0.5 transition-colors ${showRaw ? 'text-foreground' : ''}`}
      >
        <span
          className={`inline-block w-7 h-4 rounded-full border transition-colors ${showRaw ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
        >
          <span
            className={`inline-block w-3 h-3 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${showRaw ? 'translate-x-3.5' : 'translate-x-0.5'}`}
          />
        </span>
        Raw markdown
      </span>
    </button>
  );
}
