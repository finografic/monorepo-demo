import type { BadgeColorName } from '@workspace/shared';
import { BADGE_COLOR_CLASSES } from '@workspace/shared';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { ArrowRight, BarChart3, Bot, Globe, Palette, ShieldCheck, Terminal, Zap } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';

import { DEFAULT_LANGUAGE } from '../i18n/i18n.constants';

const GITHUB_URL = 'https://github.com/finografic/monorepo-demo';
const BADGE_LAYOUT =
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium';

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
  'Accessible UI',
  'AI Markdown / LLM UI',
  'Data Visualisation',
  'Security Scanning',
  'Full-stack Monorepo',
] as const;

const DEMOS: Array<{
  id: string;
  numberLabel: string;
  title: string;
  description: string;
  tags: Array<{ label: string; color: BadgeColorName }>;
  url: string;
  disabledInProduction: boolean;
  Icon: LucideIcon;
  iconClass: string;
}> = [
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
    Icon: Bot,
    iconClass: 'text-violet-600',
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
    Icon: BarChart3,
    iconClass: 'text-sky-600',
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
    Icon: Terminal,
    iconClass: 'text-emerald-600',
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
    iconBgClass: 'bg-emerald-500/10',
  },
  {
    key: 'i18n',
    Icon: Globe,
    titleKey: 'app.features.i18n.title',
    titleDefault: 'i18n — DB-backed',
    descKey: 'app.features.i18n.desc',
    descDefault: 'Server-side translation tables with en-GB and es-ES, served via i18next HTTP backend.',
    iconClass: 'text-sky-600',
    iconBgClass: 'bg-sky-500/10',
  },
  {
    key: 'design',
    Icon: Palette,
    titleKey: 'app.features.design.title',
    titleDefault: 'Design System',
    descKey: 'app.features.design.desc',
    descDefault: 'shadcn components with Tailwind 4 tokens, recipes, and owned source components.',
    iconClass: 'text-violet-600',
    iconBgClass: 'bg-violet-500/10',
  },
  {
    key: 'stack',
    Icon: Zap,
    titleKey: 'app.features.stack.title',
    titleDefault: 'Modern Stack',
    descKey: 'app.features.stack.desc',
    descDefault:
      'Hono + Drizzle ORM server. Vite 8, React 19, React Router v7, Tanstack Query + Hono RPC client.',
    iconClass: 'text-amber-600',
    iconBgClass: 'bg-amber-500/10',
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
            <Button asChild size="lg" className="min-h-11 gap-1.5 px-5 shadow-sm">
              <a href="#portfolio-demos">
                View portfolio demos
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-11 border-slate-300 px-5">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                View source on GitHub
              </a>
            </Button>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <div className="flex justify-center">
              <span className={`${BADGE_LAYOUT} border border-slate-500/20 bg-slate-500/10 text-slate-700`}>
                {t('app.badge', 'Built on @finografic/monorepo-starter')}
              </span>
            </div>
            <ul className="mt-2 flex flex-wrap items-center justify-center gap-2">
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

      {/* Portfolio demos — primary focus */}
      <section id="portfolio-demos" className="scroll-mt-20 bg-blue-50/40">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-6 md:pt-7 md:pb-7">
          <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">Portfolio Demos</h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Live interactive demos built to address specific frontend engineering capabilities.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {DEMOS.map((demo) => {
              const isDisabled = demo.disabledInProduction && import.meta.env.PROD;

              return (
                <Card
                  key={demo.id}
                  className="flex flex-col overflow-visible rounded-2xl border-2 border-slate-200/90 bg-white shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <CardContent className="flex flex-1 flex-col gap-3 overflow-visible p-5 sm:p-6">
                    <div className="flex items-start gap-2">
                      <div className="flex w-10 shrink-0 justify-start pt-0.5" aria-hidden="true">
                        <demo.Icon className={`size-8 ${demo.iconClass}`} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold leading-snug text-foreground">
                          <span className="text-foreground/50">{demo.numberLabel}</span>
                          <br />
                          {demo.title}
                          {isDisabled ? (
                            <span
                              className={`${BADGE_LAYOUT} ml-2 align-middle ${BADGE_COLOR_CLASSES.emerald}`}
                            >
                              Soon
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{demo.description}</p>

                    <div className="flex flex-nowrap gap-1.5 overflow-x-visible">
                      {demo.tags.map((tag) => (
                        <span key={tag.label} className={`${BADGE_LAYOUT} ${BADGE_COLOR_CLASSES[tag.color]}`}>
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Monorepo features — below demos */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 md:pt-7 md:pb-14">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            {t('app.features.heading', 'Monorepo Features')}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.key} className="border-2">
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
