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
        <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded text-foreground">{children}</code>
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
        className="my-4 overflow-x-auto rounded-lg border border-border"
      >
        <table className="min-w-full text-sm">{children}</table>
      </div>
    );
  },

  th({ children }) {
    return (
      <th className="px-4 py-2.5 text-left font-semibold bg-muted text-foreground border-b border-border">
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td className="px-4 py-2.5 text-muted-foreground border-b border-border last:border-b-0">{children}</td>
    );
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
    return <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-xl font-semibold mt-5 mb-2.5 text-foreground">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>;
  },
  p({ children }) {
    return <p className="my-3 text-foreground/90 leading-relaxed">{children}</p>;
  },
  ul({ children }) {
    return <ul className="my-3 ml-5 list-disc space-y-1 text-foreground/90">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-3 ml-5 list-decimal space-y-1 text-foreground/90">{children}</ol>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-3 pl-4 border-l-4 border-primary/40 text-muted-foreground italic">
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
