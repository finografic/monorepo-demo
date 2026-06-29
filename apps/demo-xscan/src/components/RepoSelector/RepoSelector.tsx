import { resolveBadgeClass } from '@workspace/shared';
import { OptionCard } from '@workspace/shared/components';
import { useCallback, useRef } from 'react';
import type { RepoMeta } from 'data/types';

interface RepoSelectorProps {
  repos: RepoMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const repoTagColors: Record<string, string> = {
  'pnpm': 'sky',
  'yarn': 'amber',
  'Monorepo': 'purple',
  'Portfolio': 'blue',
  'Legacy': 'orange',
  'Dependabot': 'green',
  'OSV.dev': 'teal',
  'GitHub Advisory': 'rose',
  'Self-scan': 'blue',
  'CV site': 'rose',
};

export function RepoSelector({ repos, selectedId, onSelect }: RepoSelectorProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
      const items = listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]');
      if (!items) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[Math.min(index + 1, items.length - 1)]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[Math.max(index - 1, 0)]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(repos[index]!.id);
      }
    },
    [repos, onSelect],
  );

  return (
    <nav aria-label="Public GitHub repositories">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Choose a repository
      </p>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Repository selection"
        aria-orientation="vertical"
        className="space-y-2"
      >
        {repos.map((repo, index) => (
          <OptionCard
            key={repo.id}
            title={repo.title}
            description={repo.description}
            badges={repo.tags.map((tag) => ({
              label: tag,
              className: resolveBadgeClass(repoTagColors[tag] ?? 'blue'),
            }))}
            selected={repo.id === selectedId}
            onSelect={() => onSelect(repo.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </ul>
    </nav>
  );
}
