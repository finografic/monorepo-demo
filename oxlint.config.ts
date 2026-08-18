import {
  categories,
  configOverrides,
  env,
  ignorePatterns,
  loosenRules,
  options,
  plugins,
  rules,
  testOverrides,
} from '@finografic/oxc-config/oxlint';
import { defineConfig } from 'oxlint';
import type { OxlintConfig } from 'oxlint';

export default defineConfig({
  plugins: [...plugins],
  env,
  options: {
    ...options,
    // Raw TypeScript compiler diagnostics, re-reported by oxlint from its own program. That program
    // does not match the real tsconfigs — the per-app `include: ["src"]` leaves oxlint.config.ts
    // outside any project — so it invents errors that `pnpm typecheck` does not agree with. tsc
    // already covers these files properly; type-aware lint *rules* stay on via `typeAware`.
    typeCheck: false,
  },
  categories,
  rules: { ...rules, ...loosenRules, 'react/react-in-jsx-scope': 'off' },
  overrides: [testOverrides, configOverrides],
  ignorePatterns: [...ignorePatterns],
} satisfies OxlintConfig);
