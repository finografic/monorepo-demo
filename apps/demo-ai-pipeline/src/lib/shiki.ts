import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark', 'vitesse-light'],
      langs: [
        'typescript',
        'javascript',
        'tsx',
        'jsx',
        'bash',
        'json',
        'yaml',
        'css',
        'html',
        'markdown',
        'sql',
      ],
    });
  }
  return highlighterPromise;
}

export function highlightCode(highlighter: Highlighter, code: string, lang: string, isDark: boolean): string {
  const theme = isDark ? 'vitesse-dark' : 'vitesse-light';
  const supportedLangs = highlighter.getLoadedLanguages();
  const resolvedLang = supportedLangs.includes(lang) ? lang : 'text';

  return highlighter.codeToHtml(code, { lang: resolvedLang, theme });
}
