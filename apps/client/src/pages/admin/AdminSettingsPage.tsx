import { Card, CardContent } from '@workspace/ui/components/card';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function AdminSettingsPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t('admin.pages.settings.title', 'Settings')}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {t('admin.pages.settings.subtitle', 'Application configuration')}
      </p>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('admin.pages.settings.placeholder', 'Settings coming soon.')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
