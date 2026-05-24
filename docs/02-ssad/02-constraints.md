---
title: arc42 §2 — Constraints
phase: ssad
status: active
owner: data-team
last_updated: 2026-05-24
---

# arc42 §2 — Constraints

## Technical constraints

| ID | Constraint | Rationale |
|---|---|---|
| TC-1 | React 18 + TypeScript (strict mode, ES2020 target) | Established frontend standard across Readmigo web projects |
| TC-2 | MUI v6 with Grid v1 API (`xs={12}` syntax, NOT Grid v2 `size` prop) | Grid v2 migration not yet validated; v1 API is stable |
| TC-3 | All colors from `src/theme/brandTokens.ts` — no hardcoded hex values | Design consistency enforced via token system |
| TC-4 | Vite 5 as build tool, Node.js 20.x runtime | Team-wide build tooling standard |
| TC-5 | pnpm 9 as package manager with frozen lockfile in CI | Deterministic builds, faster installs |
| TC-6 | Playwright for E2E testing (no unit test framework configured) | Current testing strategy prioritizes integration coverage |
| TC-7 | `VITE_` prefix required for all client-side environment variables | Vite security model — only VITE_ vars are exposed to the browser |

## Organizational constraints

| ID | Constraint | Rationale |
|---|---|---|
| OC-1 | Owned by `data-team` | Small team responsible for all analytics and dashboard features |
| OC-2 | Single repository, single deployable | No micro-frontend architecture; monolithic SPA |
| OC-3 | Auto-deploy on push to main | GitHub Actions CI then GitHub Pages / Vercel; no manual deployment steps |
| OC-4 | Internal tool — no public user-facing SLA | Used only by Readmigo operations, product, and content teams |

## Legal & compliance constraints

| ID | Constraint | Rationale |
|---|---|---|
| LC-1 | PostHog data governed by PostHog Cloud terms | Analytics data stored in PostHog US region (us.posthog.com) |
| LC-2 | Internal test user filtering required | 4 test account IDs must be excluded from all analytics to prevent data pollution |
| LC-3 | Private repository | Dashboard code and configuration are not open source |

Related: [01-introduction-goals.md](./01-introduction-goals.md)
