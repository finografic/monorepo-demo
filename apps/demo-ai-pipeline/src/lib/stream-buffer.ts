export interface SplitResult {
  safe: string;
  pending: string;
}

/**
 * Splits a streaming markdown buffer at the last unclosed triple-backtick fence.
 *
 * Prevents visual glitches where a half-received code block or Mermaid definition
 * is passed to the renderer before the closing fence arrives.
 */
export function splitAtUnclosedFence(buffer: string): SplitResult {
  if (!buffer) return { safe: '', pending: '' };

  const fencePattern = /^```/m;
  const lines = buffer.split('\n');

  let openFenceIndex = -1;
  let fenceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    if (fencePattern.test(lines[i]!)) {
      fenceCount++;
      if (fenceCount % 2 === 1) {
        openFenceIndex = i;
      } else {
        openFenceIndex = -1;
      }
    }
  }

  if (openFenceIndex === -1) {
    return { safe: buffer, pending: '' };
  }

  const safeLines = lines.slice(0, openFenceIndex);
  const pendingLines = lines.slice(openFenceIndex);

  return {
    safe: safeLines.join('\n'),
    pending: pendingLines.join('\n'),
  };
}
