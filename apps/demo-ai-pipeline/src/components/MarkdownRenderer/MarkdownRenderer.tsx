import { CodeBlock } from 'components/CodeBlock/CodeBlock';
import { MermaidBlock } from 'components/MermaidBlock/MermaidBlock';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.['code'] ?? []), 'className'],
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.['div'] ?? []), 'className'],
  },
};

const components: Components = {
  code({ className, children, ...props }) {
    const isBlock = !('inline' in props);
    const lang = /language-(\w+)/.exec(className ?? '')?.[1] ?? '';
    const code = (typeof children === 'string' ? children : '').replace(/\n$/, '');

    if (!isBlock && !className) {
      return (
        <code className="font-mono text-[0.85em] bg-muted/70 px-1.5 py-0.5 rounded border border-border/50 text-foreground">
          {children}
        </code>
      );
    }

    if (lang === 'mermaid') {
      return <MermaidBlock code={code} />;
    }

    return <CodeBlock code={code} language={lang} />;
  },

  table({ children }) {
    return (
      <div
        role="region"
        aria-label="Data table"
        className="my-6 overflow-x-auto rounded-lg border border-border shadow-sm"
      >
        <table className="min-w-full text-sm">{children}</table>
      </div>
    );
  },

  th({ children }) {
    return (
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider bg-muted text-muted-foreground border-b border-border">
        {children}
      </th>
    );
  },

  tr({ children }) {
    return (
      <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
        {children}
      </tr>
    );
  },

  td({ children }) {
    return <td className="px-4 py-2.5 text-foreground/80">{children}</td>;
  },

  a({ href, children }) {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },

  h1({ children }) {
    return (
      <h1 className="text-2xl font-bold mt-8 mb-4 text-foreground pb-2 border-b border-border">{children}</h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="text-xl font-semibold mt-7 mb-3 text-foreground pb-1.5 border-b border-border/50">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold mt-5 mb-2 text-foreground">{children}</h3>;
  },
  p({ children }) {
    return <p className="my-3 text-foreground/85 leading-7">{children}</p>;
  },
  ul({ children }) {
    return <ul className="my-3 ml-6 list-disc space-y-1.5 text-foreground/85">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-3 ml-6 list-decimal space-y-1.5 text-foreground/85">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-7">{children}</li>;
  },
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-foreground/90">{children}</em>;
  },
  hr() {
    return <hr className="my-6 border-border" />;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-4 pl-4 border-l-4 border-primary/50 bg-muted/30 rounded-r-md py-2 text-muted-foreground italic">
        {children}
      </blockquote>
    );
  },
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
