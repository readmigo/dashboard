---
title: arc42 §4 — Solution Strategy
phase: ssad
status: active
owner: data-team
last_updated: 2026-05-24
---

# arc42 §4 — Solution Strategy

## Technical decisions

| Decision | Choice | Alternative considered | Rationale |
|---|---|---|---|
| Admin framework | react-admin v5 | Custom React + React Router | Built-in CRUD, data provider abstraction, i18n, auth integration |
| Analytics engine | PostHog HogQL | Pre-built PostHog dashboards, Metabase | Full SQL flexibility, same data source as production events |
| UI component library | MUI v6 | Ant Design, Chakra UI | react-admin natively integrates with MUI; design token support |
| State management | React Context API (4 contexts) | Redux, Zustand | Sufficient for dashboard-level state; avoids extra dependency |
| Chart library | Recharts | Chart.js, D3 | Declarative React components, simple integration with MUI |
| Build tool | Vite 5 | Webpack, Turbopack | Fast HMR, native ES modules, simple config |
| Styling approach | MUI sx prop + brandTokens.ts | CSS Modules, Tailwind, styled-components | Consistent with MUI theming; tokens enforce brand consistency |

## Architectural patterns

| Pattern | Application |
|---|---|
| **Provider pattern** | 4 React Contexts wrap the app tree (Environment, Timezone, ContentLanguage, Content) |
| **Data provider abstraction** | react-admin DataProvider decouples pages from API implementation |
| **Design token system** | 3-tier: brandTokens.ts, theme.ts (MUI theme), chartColors.ts (Recharts palette) |
| **Dual data source** | CRUD data from REST API, analytics from PostHog HogQL — unified in the same UI |
| **Environment switching** | Runtime local/production toggle persisted in localStorage |
| **Global error boundary** | React ErrorBoundary at root + debug logging ring buffer (200 entries) |

## Quality-attribute strategies

| Quality | Strategy |
|---|---|
| **Data accuracy** | Internal user filtering (4 test account IDs), PostHog HogQL direct queries |
| **Responsiveness** | Vite HMR for development, code splitting via dynamic imports, Recharts lazy rendering |
| **Reliability** | GlobalErrorBoundary catches React errors, global debug logging captures all errors/warnings |
| **Maintainability** | Design tokens centralize styling, react-admin conventions for CRUD pages, TypeScript strict mode |
| **Usability** | Multi-timezone support (6 zones), content language filter (en/zh/all), 4-locale UI (EN, ZH-Hans, ZH-Hant, DE) |

Related: [01-introduction-goals.md](./01-introduction-goals.md), [05-building-blocks.md](./05-building-blocks.md)
