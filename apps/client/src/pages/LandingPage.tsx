import type { BadgeColorName } from '@workspace/shared';
import { BADGE_COLOR_CLASSES } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Col, Row } from '@workspace/ui/components/grid';
import { ArrowRight, Globe, Palette, ShieldCheck, Zap } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '../i18n/i18n.constants';

const GITHUB_URL = 'https://github.com/finografic/monorepo-demo';
const BADGE_LAYOUT =
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium';

interface DemoCallout {
  id: string;
  numberLabel: string;
  title: string;
  description: string;
  tags: Array<{ label: string; color: BadgeColorName }>;
  url: string;
  disabledInProduction: boolean;
}

function GitHubMark(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27s-1.36.09-2 .27c-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

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

const CAPABILITY_CHIPS = [
  'React + TypeScript',
  'Full-stack Monorepo',
  'AWS server deployment',
  'Accessible UI',
  'AI Markdown / LLM UI',
  'Data Visualisation',
  'Security Scanning',
] as const;

const DEMOS: DemoCallout[] = [
  {
    id: 'ai-pipeline',
    numberLabel: 'Demo 1:',
    title: 'AI Markdown Pipeline',
    description:
      'LLM-powered markdown generation using public Queensland TMR data, with live streaming, fixture replay, Mermaid diagrams, Shiki code highlighting, and RAG-style service guidance.',
    tags: [
      { label: 'LLM UI', color: 'violet' },
      { label: 'Streaming SSE', color: 'cyan' },
      { label: 'Mermaid', color: 'indigo' },
      { label: 'Shiki', color: 'amber' },
    ],
    url: demoUrl('demo-ai-pipeline', 'http://localhost:3001', import.meta.env['VITE_DEMO_AI_PIPELINE_URL']),
    disabledInProduction: false,
  },
  {
    id: 'datavis',
    numberLabel: 'Demo 2:',
    title: 'Transport Data Dashboard',
    description:
      'Accessible Queensland TMR dashboard with interactive charts, keyboard-friendly views, source links, and live Open Data catalogue integration.',
    tags: [
      { label: 'Data visualisation', color: 'sky' },
      { label: 'Recharts', color: 'blue' },
      { label: 'D3', color: 'orange' },
      { label: 'WCAG AA', color: 'emerald' },
    ],
    url: demoUrl('demo-datavis', 'http://localhost:3002', import.meta.env['VITE_DEMO_DATAVIS_URL']),
    disabledInProduction: false,
  },
  {
    id: 'xscan',
    numberLabel: 'Demo 3:',
    title: 'Supply-Chain Security Scanner',
    description:
      'Browser-based supply-chain security scanner for GitHub repositories, with lockfile dependency-tree analysis, terminal streaming, and structured summaries.',
    tags: [
      { label: 'Supply chain', color: 'amber' },
      { label: 'xterm.js', color: 'slate' },
      { label: 'Security', color: 'emerald' },
      { label: 'SSE', color: 'cyan' },
    ],
    url: demoUrl('demo-xscan', 'http://localhost:3003', import.meta.env['VITE_DEMO_XSCAN_URL']),
    disabledInProduction: false,
  },
];

const FEATURES = [
  {
    key: 'auth',
    Icon: ShieldCheck,
    titleKey: 'app.features.auth.title',
    titleDefault: 'Auth.js + JWT',
    descKey: 'app.features.auth.desc',
    descDefault:
      'Credentials provider with JWT strategy, role-based access control, and secure cookie sessions.',
    iconClass: 'text-emerald-600',
    iconBgClass: 'bg-emerald-500/20',
  },
  {
    key: 'i18n',
    Icon: Globe,
    titleKey: 'app.features.i18n.title',
    titleDefault: 'i18n - DB-backed',
    descKey: 'app.features.i18n.desc',
    descDefault: 'Server-side translation tables with en-GB and es-ES, served via i18next HTTP backend.',
    iconClass: 'text-sky-600',
    iconBgClass: 'bg-sky-500/20',
  },
  {
    key: 'design',
    Icon: Palette,
    titleKey: 'app.features.design.title',
    titleDefault: 'Design System',
    descKey: 'app.features.design.desc',
    descDefault: 'shadcn components with Tailwind 4 tokens, recipes, and owned source components.',
    iconClass: 'text-violet-600',
    iconBgClass: 'bg-violet-500/20',
  },
  {
    key: 'stack',
    Icon: Zap,
    titleKey: 'app.features.stack.title',
    titleDefault: 'Modern Stack',
    descKey: 'app.features.stack.desc',
    descDefault:
      'Hono + Drizzle ORM server, deployed to AWS. Vite 8, React 19, React Router v7, Tanstack Query + Hono RPC client.',
    iconClass: 'text-amber-600',
    iconBgClass: 'bg-amber-500/20',
  },
];

export function LandingPage(): React.JSX.Element {
  // NOTE: `fallbackLng` is en-GB, but the active locale comes from i18next-browser-languagedetector
  //       (`localStorage.i18nextLng` first, then `navigator`). See Layout.tsx for the same context.
  // TEMP: Force en-GB for all landing `t(...)` calls — not a global detection fix; route-scoped override
  //       until portfolio/demo copy is fully externalised to packages/i18n.
  // TODO: Replace with standard `useTranslation()` after docs/todo/TODO_I18N.md Phase E.
  const { t } = useTranslation(undefined, { lng: DEFAULT_LANGUAGE });

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-6 text-center md:pt-16 md:pb-7">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('app.title', 'monorepo-demo')}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t(
              'app.subtitle',
              'Practical React/TypeScript demos showcasing AI UIs, data visualisation, and security-conscious full-stack engineering.',
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="min-h-11 gap-1.5 px-5 shadow-sm md:hidden">
              <a href="#portfolio-demos">
                View portfolio demos
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-11 gap-1.5 border-slate-300 px-5 text-slate-700"
            >
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GitHubMark />
                View source on GitHub
              </a>
            </Button>
          </div>

          <div className="mx-auto mt-8 max-w-6xl">
            <div className="flex justify-center">
              <span className={`${BADGE_LAYOUT} border border-slate-500/20 bg-slate-500/10 text-slate-700`}>
                {t('app.badge', 'Built on @finografic/monorepo-starter')}
              </span>
            </div>
            <ul className="mt-2 flex flex-nowrap items-center justify-center gap-2 overflow-x-auto">
              {CAPABILITY_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className={`${BADGE_LAYOUT} border border-slate-500/20 bg-slate-500/10 text-slate-600`}
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Monorepo features */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-6 md:pt-7 md:pb-7">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            {t('app.features.heading', 'Monorepo Features')}
          </h2>

          <Row align="stretch" gutterWidth={16}>
            {FEATURES.map((feature) => (
              <Col key={feature.key} xs={12} md={6} className="mb-4">
                <Card className="h-full border-2">
                  <CardContent className="flex items-start gap-4 px-5 py-3 sm:items-center sm:py-1">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${feature.iconBgClass}`}
                      aria-hidden="true"
                    >
                      <feature.Icon className={`size-8 ${feature.iconClass}`} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold">{t(feature.titleKey, feature.titleDefault)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(feature.descKey, feature.descDefault)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Portfolio demos */}
      <section id="portfolio-demos" className="scroll-mt-20 bg-blue-50/40">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 md:pt-7 md:pb-14">
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">Portfolio Demos</h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Live interactive demos built to address specific frontend engineering capabilities.
          </p>

          <Row align="stretch" gutterWidth={20}>
            {DEMOS.map((demo: DemoCallout) => {
              const isDisabled = demo.disabledInProduction && import.meta.env.PROD;

              return (
                <Col key={demo.id} xs={12} md={6} xl={4} className="mb-5">
                  <Card className="flex h-full flex-col border-2">
                    <CardContent className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold leading-snug text-foreground">
                          <span className="text-foreground/40 font-bold">{demo.numberLabel}</span>
                          <br />
                          {demo.title}
                        </p>
                        {isDisabled ? (
                          <span className={`${BADGE_LAYOUT} ${BADGE_COLOR_CLASSES.emerald}`}>Soon</span>
                        ) : null}
                      </div>

                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                        {demo.description}
                      </p>

                      <div className="flex flex-nowrap gap-1.5">
                        {demo.tags.map((tag) => (
                          <span
                            key={tag.label}
                            className={`${BADGE_LAYOUT} ${BADGE_COLOR_CLASSES[tag.color]}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>

                      {isDisabled ? (
                        <Button disabled className="mt-2 min-h-11 px-5 text-sm font-semibold shadow-sm">
                          Open demo
                        </Button>
                      ) : (
                        <Button asChild className="mt-2 min-h-11 px-5 text-sm font-semibold shadow-sm">
                          <a href={demo.url}>Open demo</a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>
    </div>
  );
}
