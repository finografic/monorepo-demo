import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AI_PIPELINE_URL = import.meta.env['VITE_DEMO_AI_PIPELINE_URL'] ?? 'http://localhost:3001';

const DEMOS = [
  {
    id: 'ai-pipeline',
    title: 'AI Markdown Pipeline',
    description:
      'Streaming markdown renderer with Shiki syntax highlighting, Mermaid diagram rendering, and partial-fence protection. Built with react-markdown + Anthropic API.',
    tags: ['Streaming SSE', 'Mermaid', 'Shiki', 'react-markdown'],
    url: AI_PIPELINE_URL,
    available: true,
  },
  {
    id: 'ecosystem',
    title: 'Package Ecosystem Explorer',
    description:
      'Force-directed graph visualisation of the @finografic npm package ecosystem — relationships, dependencies, and metadata in an interactive network diagram.',
    tags: ['D3.js', 'Force graph', 'TanStack Query'],
    url: null,
    available: false,
  },
  {
    id: 'datavis',
    title: 'Transport Data Dashboard',
    description:
      'Interactive QLD transport data dashboard with time-series charts, network diagrams, and accessible data tables built for WCAG 2.1 AA compliance.',
    tags: ['Recharts', 'Data tables', 'Accessibility'],
    url: null,
    available: false,
  },
] as const;

import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    key: 'auth',
    icon: '🔐',
    titleKey: 'app.features.auth.title',
    titleDefault: 'Auth.js + JWT',
    descKey: 'app.features.auth.desc',
    descDefault:
      'Credentials provider with JWT strategy, role-based access control, and secure cookie sessions.',
  },
  {
    key: 'i18n',
    icon: '🌍',
    titleKey: 'app.features.i18n.title',
    titleDefault: 'i18n — DB-backed',
    descKey: 'app.features.i18n.desc',
    descDefault: 'Server-side translation tables with en-GB and es-ES, served via i18next HTTP backend.',
  },
  {
    key: 'design',
    icon: '🎨',
    titleKey: 'app.features.design.title',
    titleDefault: 'Design System',
    descKey: 'app.features.design.desc',
    descDefault: 'shadcn components with Tailwind 4 tokens, recipes, and owned source components.',
  },
  {
    key: 'stack',
    icon: '⚡',
    titleKey: 'app.features.stack.title',
    titleDefault: 'Modern Stack',
    descKey: 'app.features.stack.desc',
    descDefault: 'Hono + Drizzle ORM on the server. Vite 8 + React 19 + React Router v7 on the client.',
  },
];

export function LandingPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-16 text-center">
        <Badge className="mb-4">{t('app.badge', 'Open-source starter')}</Badge>

        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {t('app.title', 'monorepo-demo')}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t('app.subtitle', 'A full-stack monorepo with auth, i18n, and a design system — ready to fork.')}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {isAuthenticated && role === 'admin' ? (
            <Button asChild>
              <Link to="/admin">{t('ui.nav.adminPanel', 'Admin Panel')}</Link>
            </Button>
          ) : isAuthenticated ? (
            <Button asChild>
              <Link to="/dashboard">{t('ui.nav.dashboard', 'Go to Dashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link to="/login">{t('ui.buttons.signIn', 'Sign In')}</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  {t('ui.buttons.viewSource', 'View on GitHub')}
                </a>
              </Button>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-semibold">
          {t('app.features.heading', "What's included")}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.key}>
              <CardContent className="p-5">
                <div className="mb-2 text-2xl">{feature.icon}</div>
                <p className="font-semibold">{t(feature.titleKey, feature.titleDefault)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(feature.descKey, feature.descDefault)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-2 text-center text-2xl font-semibold">Portfolio Demos</h2>
        <p className="mb-8 text-center text-muted-foreground text-sm">
          Live interactive demos built to address specific frontend engineering capabilities.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((demo) => (
            <Card
              key={demo.id}
              className={`flex flex-col transition-shadow ${demo.available ? 'hover:shadow-md' : 'opacity-70'}`}
            >
              <CardContent className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground leading-snug">{demo.title}</p>
                  {!demo.available && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Soon
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-snug flex-1">{demo.description}</p>

                <div className="flex flex-wrap gap-1">
                  {demo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {demo.available && demo.url ? (
                  <Button asChild size="sm" className="mt-1">
                    <a href={demo.url} target="_blank" rel="noopener noreferrer">
                      Open demo
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="mt-1">
                    Coming soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
