import type { KeyboardEventHandler, ReactNode } from 'react';

export interface OptionCardBadge {
  label: string;
  className?: string;
}

interface OptionCardProps {
  title: string;
  description: string;
  sourceContext?: string;
  sourceContextLabel?: string;
  badges?: OptionCardBadge[];
  selected: boolean;
  disabled?: boolean;
  headerAction?: ReactNode;
  children?: ReactNode;
  onSelect: () => void;
  onKeyDown: KeyboardEventHandler<HTMLLIElement>;
}

const EMPTY_BADGES: OptionCardBadge[] = [];

export function OptionCard({
  title,
  description,
  sourceContext,
  sourceContextLabel = 'Source intent',
  badges = EMPTY_BADGES,
  selected,
  disabled,
  headerAction,
  children,
  onSelect,
  onKeyDown,
}: OptionCardProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={onKeyDown}
      className={[
        'rounded-lg border-2 p-4 cursor-pointer transition-all select-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        selected
          ? 'border-primary bg-primary/5 shadow-sm bg-white'
          : 'border-border hover:border-primary/40 hover:bg-accent bg-white',
        disabled ? 'opacity-50 cursor-default pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-semibold leading-snug text-foreground">{title}</p>
        {headerAction}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {sourceContext ? (
        <p className="mt-2 text-xs font-semibold leading-5 text-primary opacity-70">
          {sourceContextLabel}: {sourceContext}
        </p>
      ) : null}
      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`inline-block rounded-full px-3 py-1.25 text-xs font-medium ${badge.className ?? ''}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}
      {children}
    </li>
  );
}
