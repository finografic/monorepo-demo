import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TranslationDomain } from './index';
import type { TranslationRow } from './useTranslationDomains';

import { api } from 'lib/api';

import { QUERY_KEYS } from './index';

interface UpdateTranslationInput {
  domain: TranslationDomain;
  id: string;
  translations: Record<string, string>;
}

async function updateTranslation({
  domain,
  id,
  translations,
}: UpdateTranslationInput): Promise<TranslationRow> {
  const res = await api.translations[':domain'][':id'].$patch({
    param: { domain, id },
    json: { translations },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export function useUpdateTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTranslation,
    onSuccess: async (_row, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.translations.domain(variables.domain),
      });
    },
  });
}
