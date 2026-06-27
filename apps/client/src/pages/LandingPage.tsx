import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
          {t('app.title', 'monorepo-starter')}
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
    </div>
  );
}
