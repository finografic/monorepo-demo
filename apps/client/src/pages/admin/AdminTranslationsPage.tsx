import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { useTranslationDomains, useUpdateTranslation } from 'queries/translations';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TranslationDomain, TranslationRow } from 'queries/translations';

const LANGUAGES = ['en-GB', 'es-ES'];
const DOMAINS: TranslationDomain[] = ['ui', 'app', 'admin'];

function TranslationDomainTable({ domain }: { domain: TranslationDomain }): React.JSX.Element {
  const rowsQuery = useTranslationDomains(domain);
  const updateTranslation = useUpdateTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const startEdit = (row: TranslationRow) => {
    setEditingId(row.id);
    setDraft(row.translations ?? {});
  };

  const saveEdit = async (id: string) => {
    await updateTranslation.mutateAsync({ domain, id, translations: draft });
    setEditingId(null);
  };

  if (rowsQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (rowsQuery.error) {
    return (
      <p className="text-sm text-destructive">
        {rowsQuery.error instanceof Error ? rowsQuery.error.message : 'Failed to load translations'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {(rowsQuery.data ?? []).map((row) => (
        <div key={row.id} className="rounded-lg border bg-card p-3 text-card-foreground">
          <div className="flex items-start justify-between gap-2">
            <code className="flex-1 break-all text-xs text-muted-foreground">{row.key}</code>
            {editingId !== row.id ? (
              <Button variant="ghost" size="xs" onClick={() => startEdit(row)}>
                Edit
              </Button>
            ) : null}
          </div>

          {editingId === row.id ? (
            <div className="mt-3 flex flex-col gap-2">
              {LANGUAGES.map((lng) => (
                <div key={lng} className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">{lng}</span>
                  <Input
                    type="text"
                    value={draft[lng] ?? ''}
                    onChange={(e) => setDraft((current) => ({ ...current, [lng]: e.target.value }))}
                    className="h-7 text-xs"
                  />
                </div>
              ))}
              <div className="mt-1 flex gap-2">
                <Button
                  size="xs"
                  disabled={updateTranslation.isPending && updateTranslation.variables.id === row.id}
                  onClick={() => void saveEdit(row.id)}
                >
                  {updateTranslation.isPending && updateTranslation.variables.id === row.id
                    ? 'Saving...'
                    : 'Save'}
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              {LANGUAGES.map((lng) => (
                <p key={lng} className="text-xs">
                  <span className="mr-1 text-muted-foreground">{lng}:</span>
                  {row.translations?.[lng] ? (
                    row.translations[lng]
                  ) : (
                    <em className="text-muted-foreground">empty</em>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function AdminTranslationsPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">
        {t('admin.pages.translations.title', 'Translations')}
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {t('admin.pages.translations.subtitle', 'Manage UI, app, and admin copy')}
      </p>

      <Tabs defaultValue="ui">
        <TabsList>
          {DOMAINS.map((domain) => (
            <TabsTrigger key={domain} value={domain}>
              {t(`admin.translations.tabs.${domain}`, domain.toUpperCase())}
            </TabsTrigger>
          ))}
        </TabsList>
        {DOMAINS.map((domain) => (
          <TabsContent key={domain} value={domain} className="mt-4">
            <TranslationDomainTable domain={domain} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
