# Markdown Rendering — Style Reference

Internal guide for how streamed markdown output is styled in `MarkdownRenderer`.

---

## Approach

All styling is applied at the **renderer level** via custom `react-markdown` component overrides —
not inline styles in the markdown source, and not Tailwind's `prose` plugin. This keeps the
markdown source clean and portable while giving full control over visual output per element.

---

## Element Map

| Markdown        | HTML           | Key classes                                       |
| --------------- | -------------- | ------------------------------------------------- |
| `# Heading 1`   | `<h1>`         | `text-2xl font-bold`, bottom border               |
| `## Heading 2`  | `<h2>`         | `text-xl font-semibold`, subtle bottom border     |
| `### Heading 3` | `<h3>`         | `text-base font-semibold`, no border              |
| paragraph       | `<p>`          | `leading-7 text-foreground/85`                    |
| `- item`        | `<ul><li>`     | disc, `ml-6`, `space-y-1.5`                       |
| `1. item`       | `<ol><li>`     | decimal, `ml-6`, `space-y-1.5`                    |
| `**bold**`      | `<strong>`     | `font-semibold text-foreground`                   |
| `_italic_`      | `<em>`         | `italic text-foreground/90`                       |
| `` `code` ``    | `<code>`       | mono, `bg-muted/70`, border, `text-[0.85em]`      |
| `---`           | `<hr>`         | `border-border my-6`                              |
| `> quote`       | `<blockquote>` | left accent border, `bg-muted/30`, italic         |
| `[text](url)`   | `<a>`          | `text-primary`, underline, external opens new tab |

---

## Code Blocks

Fenced blocks (` ```lang ` ) are routed to one of two components:

- **`mermaid`** → `MermaidBlock` — renders diagram as an SVG via the Mermaid library
- **anything else** → `CodeBlock` — syntax-highlighted via Shiki

---

## Tables

Custom `table`, `th`, `tr`, `td` overrides. Key details:

- Wrapper `div` has `overflow-x-auto` + `shadow-sm` — handles wide tables gracefully
- `th`: uppercase, `tracking-wider`, `text-xs` — clearly distinct from body text
- `tr`: `hover:bg-muted/30 transition-colors` — row hover state
- Border lives on `tr` (`last:border-b-0`), not `td` — avoids double-border on the last row

---

## Diagrams (Mermaid)

Initialized once via a module-level guard in `MermaidBlock`. Config:

```ts
mermaid.initialize({
  theme: 'base',
  securityLevel: 'strict',     // Mermaid's internal sanitisation pass
  fontFamily: 'inherit',
  flowchart: { useMaxWidth: true, htmlLabels: false, padding: 20 },
  sequence: { useMaxWidth: true },
  themeVariables: { ... },
});
```

SVG output is rendered from Mermaid with `securityLevel: 'strict'` and then injected directly. Do not
run a second DOMPurify pass over Mermaid SVG output unless the sanitizer is explicitly configured to
preserve Mermaid's generated label markup; otherwise flowchart node labels can be stripped while the
node shapes remain.

### Theming Mermaid

To customize diagram colors, pass `themeVariables` to `mermaid.initialize`:

```ts
themeVariables: {
  primaryColor: '#6366f1',
  primaryTextColor: '#fff',
  primaryBorderColor: '#4f46e5',
  lineColor: '#94a3b8',
  fontSize: '14px',
}
```

See [Mermaid theme docs](https://mermaid.js.org/config/theming.html) for the full variable list.

---

## Security

`react-markdown` never uses `dangerouslySetInnerHTML` — it maps markdown tokens to React elements
safely. The `rehype-sanitize` plugin is applied to block any raw HTML in the markdown source.

`MermaidBlock` does use `dangerouslySetInnerHTML` (SVG must be injected as HTML), guarded by
two sanitization layers described above.
