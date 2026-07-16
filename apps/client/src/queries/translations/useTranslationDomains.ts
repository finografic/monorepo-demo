import { useQuery } from '@tanstack/react-query';
import type { TranslationDomain } from './index';

import { api } from 'lib/api';

import { QUERY_KEYS } from './index';

export interface TranslationRow {
  id: string;
  key: string;
  translations: Record<string, string> | null;
  isActive: boolean | number;
}

async function fetchTranslationDomain(domain: TranslationDomain): Promise<TranslationRow[]> {
  const res = await api.i18n.translations[':domain'].$get({
    param: { domain },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export function useTranslationDomains(domain: TranslationDomain) {
  return useQuery({
    queryKey: QUERY_KEYS.translations.domain(domain),
    queryFn: () => fetchTranslationDomain(domain),
  });
}
