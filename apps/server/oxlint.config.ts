import { configOverrides, oxlintServerConfig, testOverrides } from '@finografic/oxc-config/oxlint';
import { defineConfig } from 'oxlint';
import type { OxlintConfig } from 'oxlint';

export default defineConfig({
  ...oxlintServerConfig,
  overrides: [testOverrides, configOverrides],
} satisfies OxlintConfig);
