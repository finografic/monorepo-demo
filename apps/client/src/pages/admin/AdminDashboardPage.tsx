import { Card, CardContent } from '@workspace/ui/components/card';
import { Col, Row } from '@workspace/ui/components/grid';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext';

export function AdminDashboardPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t('admin.pages.dashboard.title', 'Dashboard')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {t('admin.pages.dashboard.subtitle', 'Welcome back,')} {user?.name}
      </p>

      <Row align="stretch" gutterWidth={16}>
        <Col xs={12} sm={4} className="mb-4">
          <Card className="h-full">
            <CardContent className="p-5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t('admin.stats.users', 'Users')}
              </p>
              <p className="mt-1 text-3xl font-bold">—</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('admin.stats.registered', 'Registered accounts')}
              </p>
            </CardContent>
          </Card>
        </Col>

        <Col xs={12} sm={4} className="mb-4">
          <Card className="h-full">
            <CardContent className="p-5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t('admin.stats.languages', 'Languages')}
              </p>
              <p className="mt-1 text-3xl font-bold">2</p>
              <p className="mt-1 text-xs text-muted-foreground">en-GB · es-ES</p>
            </CardContent>
          </Card>
        </Col>

        <Col xs={12} sm={4} className="mb-4">
          <Card className="h-full">
            <CardContent className="p-5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t('admin.stats.translations', 'Translations')}
              </p>
              <p className="mt-1 text-3xl font-bold">53</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('admin.stats.translationKeys', 'Total keys (UI + App + Admin)')}
              </p>
            </CardContent>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
