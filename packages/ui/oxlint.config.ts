import { configOverrides, oxlintClientConfig, testOverrides } from '@finografic/oxc-config/oxlint';
import { defineConfig } from 'oxlint';
import type { OxlintConfig } from 'oxlint';

export default defineConfig({
  ...oxlintClientConfig,
  options: {
    ...oxlintClientConfig.options,
    typeAware: undefined,
    typeCheck: undefined,
    reportUnusedDisableDirectives: undefined,
  },
  overrides: [testOverrides, configOverrides],
} satisfies OxlintConfig);
