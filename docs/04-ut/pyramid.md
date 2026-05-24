---
title: Test Pyramid (unit layer)
phase: ut
status: active
owner: data-team
last_updated: 2026-05-24
---

# Test Pyramid (Unit Testing Layer)

## Position in the Test Pyramid

The Readmigo Dashboard follows the **inverted pyramid anti-pattern** today, with heavy reliance on E2E testing. The goal is to reverse this:

```
Current State (inverted)          Target State (pyramid)
───────────────────────          ─────────────────────

        E2E (4 tests)                    ╱╲
                                        ╱  ╲ E2E (5-10)
       CT (0 tests)                    ╱────╲
                                      ╱  CT  ╲ (10-20)
      UT (0 tests)                   ╱────────╲
    ───────────────                 ╱   UT    ╲ (100+)
                                   ╱────────────╲
```

### Layer Definitions

| Layer | Test Type | Coverage | Speed | Cost | Current | Target |
|-------|-----------|----------|-------|------|---------|--------|
| **UT (Unit)** | Isolated service/function tests; mocked deps | 65-80% | <100ms each | Low | 0 tests | 100+ tests |
| **CT (Component)** | Integration of services + components; real browser | 40-50% | 500ms-5s each | Medium | 0 tests | 10-20 tests |
| **E2E** | Full user journeys in browser; API mocking | 30-40% | 5-30s each | High | 4 tests | 5-10 tests |

### Rationale for Pyramid

**Benefits of Bottom-Heavy (UT) Strategy**:
1. **Fast Feedback**: Unit tests run in <100ms; catch bugs in development cycle
2. **Isolation**: Failed unit test pinpoints exact service/function; easy to debug
3. **Maintainability**: Changes to component internals don't break unit tests
4. **Cost**: Cheap to run 100 unit tests; expensive to maintain 100 E2E tests

**Why E2E Alone Isn't Sufficient**:
- Slow feedback loop: 30 seconds per test run delays debugging
- False negatives: Passing E2E but broken service logic (mocked responses hide real errors)
- Fragile selectors: Component refactoring breaks tests without changing behavior
- Hard to debug: Which layer failed? API? Component? State management?

---

## Boundary vs CT / E2E

### UT Boundary (What Unit Tests Should NOT Cover)

**Too High-Level** (move to CT/E2E):
- Entire page navigation flows (e.g., "click Books tab → verify data loaded") — use E2E
- Multiple service interactions together (e.g., "login + fetch user data") — use CT
- Component visual rendering (e.g., "verify button is blue") — use E2E with screenshot

**Too Low-Level** (waste of time):
- React internal hooks (useState, useEffect) — test via state output, not internals
- MUI component internals (Paper, Button layout) — assume MUI works correctly
- i18n library behavior (ra-i18n-polyglot) — test that labels load, not translation engine

### CT Boundary (Component Tests, Optional)

**In Scope** (if component tests added later):
- StatCard with all prop combinations (missing data, formatting, units)
- TrendChart with different data shapes (empty, single point, 1000+ points)
- Custom hooks (useEnvironment, custom data hooks)
- Context providers (EnvironmentProvider initialization)

**Out of Scope** (remain E2E):
- react-admin Resource scaffolding (List, Edit, Show views) — complex dependencies on dataProvider, authProvider, routing
- Page-level components (ReadingStatsPage, Dashboard) — integrate >5 services, hard to mock
- Modal/Dialog interactions in context — use E2E with real browser events

### E2E Scope (Playwright)

**Must Test via E2E** (real browser required):
- End-to-end user journeys (login → navigate → view data)
- Cross-browser compatibility (Chromium, Firefox, Safari) — currently Chromium only
- Responsive design (mobile, tablet, desktop) — currently desktop only
- Accessibility interactions (keyboard nav, screen reader announcements)

**Current E2E Suite**:
- `reading-stats.spec.ts`: Overview stats, book ranking, categories, time patterns tabs
- `environment.spec.ts`: Environment switching (local ↔ production)
- `ui-consistency.spec.ts`: UI elements rendered consistently across pages
- `push-notifications.spec.ts`: Notification composer and send flow

---

## Ratio Targets

### Google's Test Pyramid Guidance

Google recommends:
- **70% Unit Tests** (UT): Fast, cheap, isolated
- **20% Integration Tests** (CT): Cross-module, few external dependencies
- **10% E2E Tests** (E2E): Full user journeys, slow but confidence

### Dashboard Targets (Q4 2026)

| Layer | Target Ratio | Count | Execution Time | CI Time | Rationale |
|-------|--------------|-------|-----------------|---------|-----------|
| **UT** | 70% | 120-150 tests | <10s total | <15s | Services + config + utils |
| **CT** | 15% | 15-20 tests | 20-30s total | 40s | Reusable components (optional) |
| **E2E** | 15% | 5-10 tests | 60-120s total | 3-5m | User workflows + browser testing |

### Current State → Target Timeline

```
2026-05 (Today)        2026-06-30            2026-09-30           2026-12-31
  UT:  0%               UT: 30%              UT: 60%              UT: 70%
  CT:  0%               CT:  0%              CT: 10%              CT: 15%
  E2E: 4 tests          E2E: 4 tests         E2E: 6 tests         E2E: 8 tests

Phase: Infrastructure  Phase: Services      Phase: Context/Utils  Phase: Components
```

### CI/CD Impact

| Scenario | UT | CT | E2E | Total |
|----------|----|----|-----|-------|
| **Dev Workflow** (pnpm test:watch) | <5s | — | — | <5s |
| **Pre-commit** (pnpm test) | <10s | — | — | <10s |
| **PR Checks** (pnpm test + E2E) | <15s | — | 60s | 75s |
| **Nightly Full** (all layers) | <15s | 40s | 120s | 175s |

---

## Test Count Breakdown (Target Q4 2026)

### Unit Tests (120 tests, 70%)

| Component | Tests | Criticality |
|-----------|-------|-------------|
| authProvider.ts | 15 | Critical (affects all pages) |
| dataProvider.ts | 20 | Critical (CRUD for all resources) |
| environments.ts | 6 | High (env switching) |
| costConfig.ts | 7 | High (budget calculations) |
| analytics-config.ts | 8 | Medium (PostHog event mapping) |
| EnvironmentContext.tsx | 10 | High (state persistence) |
| ContentLanguageContext.tsx | 8 | Medium (i18n) |
| Utility functions | 15 | Medium (helpers) |
| posthogClient (if extracted) | 10 | Medium (analytics) |
| **Subtotal** | **99-110** | |

### Component Tests (15 tests, 15%, Optional in Phase 3)

| Component | Tests |
|-----------|-------|
| StatCard.tsx | 8 |
| TrendChart.tsx | 7 |
| **Subtotal** | **15** |

### E2E Tests (8 tests, 15%)

| Scenario | File | Status |
|----------|------|--------|
| Reading stats overview + tabs | reading-stats.spec.ts | Current |
| Environment switching | environment.spec.ts | Current |
| UI consistency across pages | ui-consistency.spec.ts | Current |
| Push notification send | push-notifications.spec.ts | Current |
| Dashboard navigation | (new) | Q4 2026 |
| CRUD operations (book create/edit) | (new) | Q4 2026 |
| Error handling (API 500) | (new) | Q4 2026 |
| Cost management dashboard | (new) | Q4 2026 |
| **Subtotal** | **8** | |

---

## Metrics & Monitoring

### Quality Gates

| Metric | Threshold | Action |
|--------|-----------|--------|
| UT Pass Rate | 100% | Fail PR if <100% |
| UT Coverage | ≥65% | Warn if below baseline |
| CT Coverage | ≥50% | Optional; warn if below |
| E2E Pass Rate | 100% | Fail PR if <100% |
| E2E Flakiness | <5% | Investigate; re-run 3x |
| CI Time (full) | <5 minutes | Optimize if exceeded |

### Dashboard Metrics (if CI Monitoring Added)

- UT execution time trend (should improve with faster hardware)
- Test count growth over time
- Coverage growth quarter-over-quarter
- Flaky test detection (tests failing intermittently)

---

## Related Documents

- [Test Plan](./test-plan.md) — Detailed scope, approach, pass/fail criteria
- [Coverage Baseline](./coverage-baseline.md) — Current state, improvement roadmap
- [E2E Test Plan](../05-ct/test-plan.md) — Integration & E2E test strategy
- [Design Views](../03-sdd/design-views.md) — Architecture context for test boundaries

