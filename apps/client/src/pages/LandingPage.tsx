import { BADGE_COLOR_CLASSES } from '@workspace/shared';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Globe, Palette, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const GITHUB_URL = 'https://github.com/finografic/monorepo-demo';

function isLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function demoUrl(path: string, localUrl: string, envUrl?: string): string {
  if (envUrl) {
    return envUrl;
  }

  if (isLocalHost()) {
    return localUrl;
  }

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${baseUrl}${path}/`;
}

const DEMOS = [
  {
    id: 'ai-pipeline',
    title: 'Demo 1: AI Markdown Pipeline',
    description:
      'LLM-powered markdown generation using public Queensland TMR data, with live streaming, fixture replay, Mermaid diagrams, Shiki code highlighting, and RAG-style service guidance.',
    tags: ['LLM UI', 'Streaming SSE', 'Mermaid', 'Shiki'],
    url: demoUrl('demo-ai-pipeline', 'http://localhost:3001', import.meta.env['VITE_DEMO_AI_PIPELINE_URL']),
    disabledInProduction: false,
  },
  {
    id: 'datavis',
    title: 'Demo 2: Transport Data Dashboard',
    description:
      'Accessible Queensland TMR dashboard with interactive charts, keyboard-friendly views, source links, and live Open Data catalogue integration.',
    tags: ['Data visualisation', 'Recharts', 'D3', 'WCAG AA'],
    url: demoUrl('demo-datavis', 'http://localhost:3002', import.meta.env['VITE_DEMO_DATAVIS_URL']),
    disabledInProduction: false,
  },
  {
    id: 'xscan',
    title: 'Demo 3: Supply-Chain Security Scanner',
    description:
      'Browser-based supply-chain security scanner for GitHub repositories, with lockfile dependency-tree analysis, terminal streaming, and structured summaries.',
    tags: ['Supply chain', 'xterm.js', 'Security', 'SSE'],
    url: demoUrl('demo-xscan', 'http://localhost:3003', import.meta.env['VITE_DEMO_XSCAN_URL']),
    disabledInProduction: false,
  },
] as const;

const FEATURES = [
  {
    key: 'auth',
    Icon: ShieldCheck,
    titleKey: 'app.features.auth.title',
    titleDefault: 'Auth.js + JWT',
    descKey: 'app.features.auth.desc',
    descDefault:
      'Credentials provider with JWT strategy, role-based access control, and secure cookie sessions.',
  },
  {
    key: 'i18n',
    Icon: Globe,
    titleKey: 'app.features.i18n.title',
    titleDefault: 'i18n — DB-backed',
    descKey: 'app.features.i18n.desc',
    descDefault: 'Server-side translation tables with en-GB and es-ES, served via i18next HTTP backend.',
  },
  {
    key: 'design',
    Icon: Palette,
    titleKey: 'app.features.design.title',
    titleDefault: 'Design System',
    descKey: 'app.features.design.desc',
    descDefault: 'shadcn components with Tailwind 4 tokens, recipes, and owned source components.',
  },
  {
    key: 'stack',
    Icon: Zap,
    titleKey: 'app.features.stack.title',
    titleDefault: 'Modern Stack',
    descKey: 'app.features.stack.desc',
    descDefault:
      'Hono + Drizzle ORM server. Vite 8, React 19, React Router v7, Tanstack Query + Hono RPC client.',
  },
];

export function LandingPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-10 text-center">
        <Badge className="mb-4 px-3 py-3">{t('app.badge', 'Open-source starter')}</Badge>

        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {t('app.title', 'monorepo-demo')}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t('app.subtitle', 'A full-stack monorepo with auth, i18n, and a design system — ready to fork.')}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isAuthenticated && role === 'admin' ? (
            <Button asChild className="min-h-11 px-5 text-sm font-semibold">
              <Link to="/admin">{t('ui.nav.adminPanel', 'Admin Panel')}</Link>
            </Button>
          ) : isAuthenticated ? (
            <Button asChild className="min-h-11 px-5 text-sm font-semibold">
              <Link to="/dashboard">{t('ui.nav.dashboard', 'Check server health')}</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="min-h-11 px-5 text-sm font-semibold">
                <Link to="/login">{t('ui.buttons.signIn', 'Sign In')}</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 px-5 text-sm font-semibold">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  {t('ui.buttons.viewSource', 'View on GitHub')}
                </a>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          {t('app.features.heading', 'Monorepo Features')}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.key} className="border-2">
              <CardContent className="flex items-center gap-4 px-5 py-1">
                <div className="flex w-12 shrink-0 items-center justify-center" aria-hidden="true">
                  <feature.Icon size={32} style={{ color: '#005EB8' }} />
                </div>
                <div>
                  <p className="font-semibold">{t(feature.titleKey, feature.titleDefault)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(feature.descKey, feature.descDefault)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-2 text-center text-2xl font-semibold">Portfolio Demos</h2>
        <p className="mb-8 text-center text-muted-foreground text-sm">
          Live interactive demos built to address specific frontend engineering capabilities.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((demo) => {
            const isDisabled = demo.disabledInProduction && import.meta.env.PROD;

            return (
              <Card key={demo.id} className="flex flex-col transition-shadow border-2 hover:shadow-md">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold leading-snug text-foreground">{demo.title}</p>
                    {isDisabled ? (
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_COLOR_CLASSES.green}`}
                      >
                        Soon
                      </span>
                    ) : null}
                  </div>

                  <p className="flex-1 text-sm leading-snug text-muted-foreground">{demo.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_COLOR_CLASSES.sky}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {isDisabled ? (
                    <Button disabled className="mt-2 min-h-11 px-5 text-sm font-semibold">
                      Open demo
                    </Button>
                  ) : (
                    <Button asChild className="mt-2 min-h-11 px-5 text-sm font-semibold">
                      <a href={demo.url}>Open demo</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
