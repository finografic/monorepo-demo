# DONE — demo-datavis QLD Transport Data Dashboard

> **Completed:** 2026-06-30 — seven chart views (five mock + two live CKAN), shared demo shell, keyboard navigation, and entrance animations on static charts.

> Portfolio demo for `apps/demo-datavis`.  
> Presents QLD transport open data via interactive charts.  
> Mock/static fixture data for core views; two live CKAN API panels.

---

## Decisions

### Libraries

| Library                      | Role                               | Why                                                    |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------ |
| **Recharts**                 | Primary charting (bar, area, line) | React-native SVG, accessible, easy RTL testing, mature |
| **D3** (d3-scale + d3-array) | Traffic heatmap colour + axis math | Mandatory per brief; ideal for custom SVG viz          |

Accessibility first-class: `role="img"` wrappers, `aria-label`, sr-only data tables, `prefers-reduced-motion` via Recharts `isAnimationActive`.

### Datasets (5 mock fixtures, QLD Open Data inspired)

| #   | Card title                                 | Chart type                 | Source inspiration                             |
| --- | ------------------------------------------ | -------------------------- | ---------------------------------------------- |
| 1   | Customer Service Centre Wait Times         | Grouped bar (Recharts)     | `customer-service-centre-wait-times` CSV       |
| 2   | Registration Call Centre — Daily Enquiries | Area chart (Recharts)      | `registration-call-centre-enquiries-daily` CSV |
| 3   | Traffic Volume — Hour × Day Heatmap        | SVG heatmap (D3 colour)    | `queensland-traffic-data-averaged-by-hour` CSV |
| 4   | Translink Monthly Performance              | Dual-line chart (Recharts) | `translink-monthly-performance-data` CSV       |
| 5   | Traffic Census — Road Network              | Horizontal bar (Recharts)  | `traffic-census-queensland-state-declared` CSV |

### Layout

Mirror `apps/demo-ai-pipeline` exactly:

```
┌───── Left sidebar (30rem) ────┬───────── Main pane ───────────┐
│ Title + description           │ Chart title + source badge    │
│ ─────────────────             │                               │
│ [Chart card 1] ●              │ [Recharts / D3 chart]         │
│ [Chart card 2]                │                               │
│ [Chart card 3]                │                               │
│ [Chart card 4]                │                               │
│ [Chart card 5]                │                               │
│                               ├───────────────────────────────┤
│                               │ Source attribution + note     │
└───────────────────────────────┴───────────────────────────────┘
```

---

## Phases

### Phase 1 — Scaffold

- [x] `index.html`
- [x] `package.json` (recharts, d3, vite, react, tailwind)
- [x] `tsconfig.json`
- [x] `vite.config.ts` (port 3002, same alias pattern)
- [x] `vitest.config.ts`
- [x] `oxlint.config.ts`
- [x] `src/main.tsx`
- [x] `src/App.tsx`

### Phase 2 — Mock data fixtures

- [x] `src/data/types.ts` (shared types)
- [x] `src/data/wait-times.ts` (8 QLD service centres)
- [x] `src/data/call-volume.ts` (31 days May 2026)
- [x] `src/data/traffic-heatmap.ts` (7 × 24 grid)
- [x] `src/data/translink-performance.ts` (12 months)
- [x] `src/data/traffic-census.ts` (10 roads)
- [x] `src/data/charts.ts` (registry: id, title, description, tags)

### Phase 3 — Layout shell

- [x] `src/pages/DemoPage.tsx` (sidebar + main pane)
- [x] `src/components/ChartSelector/ChartSelector.tsx` (keyboard nav, card list)

### Phase 4 — Chart components

- [x] `src/components/charts/WaitTimesChart.tsx` (Recharts grouped bar)
- [x] `src/components/charts/CallVolumeChart.tsx` (Recharts area)
- [x] `src/components/charts/TrafficHeatmap.tsx` (D3 colour + SVG)
- [x] `src/components/charts/TranslinkPerformance.tsx` (Recharts dual-line)
- [x] `src/components/charts/TrafficCensus.tsx` (Recharts horizontal bar)
- [x] `src/components/ChartPane/ChartPane.tsx` (wrapper: title, source, chart)

### Phase 5 — Accessibility

- [x] sr-only `<table>` inside each chart (screen reader data fallback)
- [x] `role="img"` + `aria-labelledby` on all chart wrappers
- [x] Colour contrast verified (primary blue scale passes AA)
- [x] Keyboard navigation on chart selector cards

### Phase 6 — Validate

- [x] `pnpm --filter @workspace/demo-datavis typecheck`
- [x] `pnpm --filter @workspace/demo-datavis lint`
- [x] Dev server smoke: all chart views render correctly

### Post-plan enhancements (also shipped)

- [x] `DemoLayout` + `DemoAuthGuard` from `@workspace/shared`
- [x] Two live CKAN views: `live-catalogue`, `live-wait-times`
- [x] Keyboard navigation between sidebar and chart pane (including heatmap grid)
- [x] Common Recharts props centralized in `src/constants/charts.config.ts`
- [x] Entrance animations on static mock charts (`CHART_ENTRANCE_ANIMATION`)

---

## Data source attribution (footer note)

> Mock data — shapes inspired by Queensland Open Data (data.qld.gov.au), Department of Transport and Main Roads.
> Not official TMR reporting. For portfolio demonstration purposes only.
