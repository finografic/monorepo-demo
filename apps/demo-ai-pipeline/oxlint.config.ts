import { configOverrides, oxlintClientConfig, testOverrides } from '@finografic/oxc-config/oxlint';
import { defineConfig } from 'oxlint';
import type { OxlintConfig } from 'oxlint';

export default defineConfig({
  ...oxlintClientConfig,
  rules: {
    ...oxlintClientConfig.rules,
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [testOverrides, configOverrides],
} satisfies OxlintConfig);
