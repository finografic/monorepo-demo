import { describe, expect, it } from 'vitest';

import { splitAtUnclosedFence } from '../stream-buffer';

describe('splitAtUnclosedFence', () => {
  it('returns empty safe and pending for empty buffer', () => {
    expect(splitAtUnclosedFence('')).toEqual({ safe: '', pending: '' });
  });

  it('returns full buffer as safe when no fences', () => {
    const text = '# Heading\n\nSome prose here.';
    expect(splitAtUnclosedFence(text)).toEqual({ safe: text, pending: '' });
  });

  it('returns full buffer as safe when fence is complete', () => {
    const text = '# Heading\n\n```typescript\nconst x = 1;\n```\n\nMore prose.';
    expect(splitAtUnclosedFence(text)).toEqual({ safe: text, pending: '' });
  });

  it('splits at unclosed opening fence', () => {
    const text = '# Heading\n\nProse.\n\n```typescript\nconst x = 1;';
    const result = splitAtUnclosedFence(text);
    expect(result.safe).toBe('# Heading\n\nProse.');
    expect(result.pending).toContain('```typescript');
    expect(result.pending).toContain('const x = 1;');
  });

  it('handles multiple complete fences correctly', () => {
    const text = '```ts\nconst a = 1;\n```\n\nProse.\n\n```ts\nconst b = 2;\n```\n\nEnd.';
    expect(splitAtUnclosedFence(text)).toEqual({ safe: text, pending: '' });
  });

  it('splits at unclosed fence after multiple complete ones', () => {
    const text = '```ts\nconst a = 1;\n```\n\nProse.\n\n```mermaid\nflowchart TD\n  A --> B';
    const result = splitAtUnclosedFence(text);
    expect(result.safe).toContain('```ts\nconst a = 1;\n```');
    expect(result.pending).toContain('```mermaid');
    expect(result.pending).toContain('A --> B');
    expect(result.safe).not.toContain('```mermaid');
  });

  it('handles mermaid fence as unclosed', () => {
    const text = 'Intro\n\n```mermaid\nflowchart TD\n  A --> B\n  B --> C';
    const result = splitAtUnclosedFence(text);
    expect(result.safe).toBe('Intro');
    expect(result.pending).toContain('```mermaid');
  });

  it('handles content with no newlines', () => {
    const text = 'Just a single line of prose with no fences';
    expect(splitAtUnclosedFence(text)).toEqual({ safe: text, pending: '' });
  });
});
