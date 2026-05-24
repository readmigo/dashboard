---
title: arc42 §8 — Technical Debt & Risks
phase: ssad
status: active
owner: data-team
last_updated: 2026-05-24
---

# arc42 §8 — Technical Debt & Risks

## Known technical debt

| ID | Debt | Severity | Effort to resolve |
|---|---|---|---|
| TD-1 | No unit tests — only Playwright E2E tests exist | High | Medium — add Vitest + React Testing Library |
| TD-2 | Dual content filter contexts (`ContentLanguageContext` + `ContentContext`) with overlapping responsibility | Medium | Low — consolidate into single context |
| TD-3 | Debug logging system (`window.__DEBUG_LOG__`) runs in production builds | Low | Low — conditionally compile or disable in production |
| TD-4 | `console.error` override in `src/main.tsx` may interfere with third-party library error reporting | Low | Low — scope override or use Sentry SDK instead |

## Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | PostHog API downtime blocks all analytics dashboards | Low | High | Graceful degradation — show cached data or "data unavailable" state |
| R-2 | PostHog HogQL query schema changes break analytics | Medium | High | Pin query templates in `posthog-queries.ts`; add integration tests |
| R-3 | JWT auth is the single authentication mechanism (no MFA, no SSO) | Low | Medium | Acceptable for internal tool; consider SSO if team grows |
| R-4 | `VITE_POSTHOG_PERSONAL_API_KEY` exposed in client bundle | Medium | Medium | Key scoped to read-only analytics; rotate quarterly |
| R-5 | No offline support — requires network for all data | Low | Low | Acceptable for internal operations tool |
| R-6 | Single main branch deployment — no staging environment | Medium | Medium | Use environment switching (local/production) for pre-deploy verification |

## Evolution roadmap

| Priority | Initiative | Status |
|---|---|---|
| High | Add Vitest unit tests for services and config modules | Planned |
| High | Consolidate dual content filter contexts | Planned |
| Medium | Add staging environment for pre-production validation | Planned |
| Medium | Implement PostHog query result caching with TTL | Planned |
| Low | Remove debug logging from production builds | Backlog |
| Low | Add SSO authentication option | Backlog |

Related: [02-constraints.md](./02-constraints.md), [07-cross-cutting.md](./07-cross-cutting.md)
