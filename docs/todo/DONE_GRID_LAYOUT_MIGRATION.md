# DONE — Migrate Tailwind Layouts to `@workspace/ui` Grid

> **Completed:** 2026-07-14. Converted page/section Tailwind layout
> (`grid` / `grid-cols-*` / responsive column utilities) to
> `Row` / `Col` from `@workspace/ui/components/grid`. Micro-alignment, shadcn internals,
> and intentional special layouts left as Tailwind.

📅 2026-07-14

## Goal

Make multi-column and responsive page layouts consistent across **monorepo-demo** by using the
shared 12-column flexbox grid in `@workspace/ui`, instead of one-off Tailwind layout classes.

Reference:

- [`packages/ui/src/components/grid/grid.css`](../../packages/ui/src/components/grid/grid.css)
- [`packages/ui/src/components/grid/index.ts`](../../packages/ui/src/components/grid/index.ts)
  (`Container`, `Row`, `Col`)
- Grid CSS is already imported via [`packages/ui/src/styles/globals.css`](../../packages/ui/src/styles/globals.css)

## What shipped

| Surface                         | Before                                 | After                               |
| ------------------------------- | -------------------------------------- | ----------------------------------- |
| `LandingPage` Monorepo Features | `grid grid-cols-1 md:grid-cols-2`      | `Row` + `Col xs={12} md={6}`        |
| `LandingPage` Portfolio Demos   | `grid … md:grid-cols-2 xl:grid-cols-3` | `Row` + `Col xs={12} md={6} xl={4}` |
| `AdminDashboardPage` stats      | `grid … sm:grid-cols-3`                | `Row` + `Col xs={12} sm={4}`        |

Import used everywhere:

```tsx
import { Col, Row } from '@workspace/ui/components/grid';
```

## Non-goals (left as-is)

| Leave as-is                                        | Why                                  |
| -------------------------------------------------- | ------------------------------------ |
| shadcn / `@workspace/ui` primitives                | Component chrome                     |
| Icon rows, badge chips, inline label+control pairs | Micro-alignment                      |
| `Layout.tsx` / `AdminLayout.tsx`                   | App chrome                           |
| `DemoLayout` `md:flex-row` shell                   | Sidebar/main overflow shell          |
| `LoginPage` `grid gap-1.5`                         | Single-column field micro-stack      |
| Chart / heatmap / terminal internals               | Domain layout                        |
| Demo apps                                          | No Convert-class `grid-cols-*` found |

## Progress

- [x] Phase 0 — Scope lock + inventory
- [x] Phase 1 — Conventions (import path confirmed via existing Vite aliases)
- [x] Phase 2 — High-traffic pages (client landing + admin)
- [x] Phase 3 — Forms and toolbars (no side-by-side bands to convert)
- [x] Phase 4 — Demo apps + shared feature components (no Convert hits)
- [x] Phase 5 — Dense UI (nothing selective required)
- [x] Phase 6 — Sweep, verification, graduation

## Phase 0 inventory (final)

| Pattern                                  | Count                   | Notes                     |
| ---------------------------------------- | ----------------------- | ------------------------- |
| Tailwind page `grid-cols-*` in `apps/**` | **0** remaining Convert | All converted             |
| `@workspace/ui/components/grid` imports  | **2** files             | Landing + Admin dashboard |
| `DemoLayout` `md:flex-row`               | **1**                   | Keep (special)            |
| `LoginPage` field `grid gap-*`           | **3**                   | Keep (micro)              |

### Allowlist (intentional non–12-col layout)

| File                               | Pattern             | Why kept                        |
| ---------------------------------- | ------------------- | ------------------------------- |
| `DemoLayout.tsx`                   | `md:flex-row` shell | Sidebar + main chrome           |
| `LoginPage.tsx`                    | `grid gap-1.5`      | Single-column field micro-stack |
| Chart / heatmap / terminal modules | domain grids        | Visualisation / terminal        |
| `packages/ui` primitives           | upstream            | Out of scope                    |

## Open questions (decided)

- **Landing `max-w-6xl` wrappers** — Kept; only inner `grid-cols-*` converted.
- **Demo cards equal height** — Used `Row align="stretch"` + `Card className="h-full"`.

## PR checklist (historical)

- [x] Structure moved to `Row`/`Col`; visual styling stays in Tailwind
- [x] No foreign grid imports
- [x] Typecheck clean for `@workspace/client`
