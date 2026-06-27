import { Button } from '@workspace/ui/components/button';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../../i18n/i18n.constants';
import type React from 'react';

import { SUPPORTED_LANGUAGES } from '../../i18n/i18n.constants';

const LABELS: Record<SupportedLanguage, string> = {
  'en-GB': 'EN',
  'es-ES': 'ES',
};

export function LanguageSwitcher(): React.JSX.Element {
  const { i18n } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  const handleChange = (lng: SupportedLanguage) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <Button
          key={lng}
          type="button"
          size="xs"
          variant={current === lng ? 'default' : 'ghost'}
          aria-label={`Switch to ${lng}`}
          aria-pressed={current === lng}
          onClick={() => handleChange(lng)}
          className="px-2 text-xs tracking-wide"
        >
          {LABELS[lng]}
        </Button>
      ))}
    </div>
  );
}
