---
title: Test Pyramid (Integration/E2E Layer)
phase: ct
status: active
owner: data-team
last_updated: 2026-05-24
---

# Test Pyramid (Integration/E2E Layer)

## Position in the Test Pyramid

The Dashboard is currently **E2E-first** (inverted pyramid); this document defines the integration/E2E layer position in the proposed pyramid:

```
Proposed Test Pyramid (Q4 2026)
───────────────────────────────

                    E2E
                   /│ \         (8 tests, 15%)
                  ╱ │  ╲
                 ╱  │   ╲       Full user journeys
                ╱───│────╲      Component integration
               ╱    │     ╲     Cross-service validation
              ╱ CT  │      ╲    (15 tests, 15%)
             ╱──────│───────╲   Component interaction
            ╱       │        ╲  Config validation
           ╱────────│─────────╲ 
          ╱   UT    │          ╲ (120 tests, 70%)
         ╱──────────│───────────╲ Service unit tests
        ╱           │            ╲ Pure function tests
       ╱────────────│─────────────╲ Config/schema tests
      ╱─────────────────────────────╲
     ╱─────────────────────────────────╲
```

### Current State (May 2026)

| Layer | Count | Status |
|-------|-------|--------|
| **UT** | 0 tests | Not implemented |
| **CT** | 0 tests | Not implemented |
| **E2E** | 4 tests | Active (reading-stats, environment, ui-consistency, push-notifications) |
| **Total** | **4 tests** | E2E-only (inverted) |

---

## Boundary vs UT / E2E

### CT (Component Testing) Scope

**In Scope** (to be implemented Q4 2026):
- Reusable components (StatCard, TrendChart) with various props
- Custom hooks (useEnvironment, useTimezone) with mock providers
- Context behavior (EnvironmentContext persistence, language switching)
- Service integration (dataProvider + React state)
- Form validation (error states, edge cases)

**Example Test** (CT layer):
```typescript
// tests/integration/StatCard.test.tsx
test('StatCard handles missing data gracefully', () => {
  render(
    <StatCard title="Active Users" value={undefined} unit="users" />
  );
  
  expect(screen.getByText('Active Users')).toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();  // Fallback
});
```

**Out of Scope** (remain E2E):
- Full page navigation (reading-stats → books → dashboard)
- Complex multi-service workflows (fetch stats + push notification)
- react-admin CRUD scaffolding (List, Edit, Show views)

---

### UT (Unit Testing) Scope

**In Scope** (to be implemented Q3 2026):
- Service methods (dataProvider.getList, getOne, create, delete)
- Pure utility functions (time conversion, date formatting)
- Config validation (cost budget calculations, event schema)
- Authentication logic (login, checkAuth, getPermissions)

**Example Test** (UT layer):
```typescript
// src/services/__tests__/dataProvider.test.ts
test('getList() adds X-Content-Filter header', async () => {
  vi.stubGlobal('fetch', vi.fn());
  
  await dataProvider.getList('books', {
    pagination: { page: 1, perPage: 10 },
  });
  
  expect(fetch).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      headers: expect.objectContaining({
        'X-Content-Filter': 'en'  // From ContentLanguageContext
      })
    })
  );
});
```

**Out of Scope** (remain CT/E2E):
- React component rendering (use CT/E2E for visual validation)
- Context integration (multiple providers together)
- API response parsing in context (use E2E for full flow)

---

### E2E (End-to-End) Scope

**In Scope** (Playwright automation):
- Complete user journeys (login → navigate → perform action)
- Full API mocking (Playwright route interception)
- Browser interactions (click, fill, submit, wait)
- Multi-page workflows
- Error recovery and retry flows

**Example Test** (E2E layer):
```typescript
// tests/reading-stats.spec.ts
test('should render overview stats correctly', async ({ page }) => {
  await setupAuth(page);
  await setupMockRoutes(page);  // Mock all API endpoints
  
  await page.goto('/reading-stats');
  await page.waitForLoadState('networkidle');
  
  expect(await page.textContent('body')).toContain('12,345');
});
```

**Out of Scope** (too high-level or too low-level):
- Unit function testing (use UT)
- Visual regression (no screenshot baseline; manual review)
- Performance testing (not in current scope)
- Accessibility compliance (manual WCAG audit)

---

## Ratio Targets

### Pyramid Ratios (Google Recommendation)

```
UT: 70% (cheap, fast, isolated)
CT: 15% (medium cost, medium speed)
E2E: 15% (expensive, slow, high confidence)
```

### Dashboard Implementation Plan

| Phase | Timeline | UT | CT | E2E | Total |
|-------|----------|----|----|-----|-------|
| **Phase 0 (Today)** | May 2026 | 0 | 0 | 4 | 4 |
| **Phase 1** | June 2026 | 100 | 0 | 4 | 104 |
| **Phase 2** | Sept 2026 | 120 | 0 | 6 | 126 |
| **Phase 3** | Dec 2026 | 140 | 15 | 8 | 163 |

### Success Metrics (Q4 2026)

| Metric | Target | Rationale |
|--------|--------|-----------|
| **UT Count** | 120-150 | Services (40), config (20), utils (20), contexts (30), helpers (20) |
| **CT Count** | 15-20 | Reusable components (StatCard, TrendChart, custom hooks) |
| **E2E Count** | 8-10 | Core journeys (reading stats, env switch, CRUD, errors, cost mgmt) |
| **UT Pass Rate** | 100% | No flaky tests |
| **CT Pass Rate** | 100% | No flaky tests |
| **E2E Pass Rate** | 100% | Failures only on real bugs |
| **UT Execution** | <10 seconds | Fast feedback in dev loop |
| **CT Execution** | 20-30 seconds | Medium feedback for component changes |
| **E2E Execution** | 60-120 seconds | Can afford slower for confidence |
| **Total CI Time** | <5 minutes | All tests + lint + build |

---

## CI/CD Integration

### Local Development (Developer Laptop)

```bash
# Quick feedback loop (UT only)
pnpm test:watch          # <100ms per test; re-run on file change

# Before committing
pnpm test                # All UT (10 seconds)
pnpm lint                # ESLint (5 seconds)

# Optional: run CT/E2E locally (slower)
pnpm test:integration    # CT (30 seconds)
pnpm test                # E2E (120 seconds)  # Full suite
```

### PR Validation (GitHub Actions)

```yaml
# .github/workflows/test.yml
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test          # UT only (10s)
  
  integration:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:integration  # CT (30s)
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test          # E2E (120s, already auto-starting dev server)
```

**Total CI time**: ~3-5 minutes (parallel jobs)

### Nightly / Scheduled Tests

```yaml
# .github/workflows/nightly.yml
on:
  schedule:
    - cron: '0 22 * * *'  # 10 PM daily
jobs:
  all-tests:
    steps:
      - run: pnpm test:coverage
      - run: pnpm test:integration
      - run: pnpm test
      - uses: codecov/codecov-action@v3
```

---

## Quality Gates & Coverage

### Test Coverage Requirements

| Layer | Target | Enforcement |
|-------|--------|------------|
| **UT** | ≥65% | Fail PR if below |
| **CT** | ≥50% | Warn in PR (informational) |
| **E2E** | ~30-40% | Not explicitly tracked |
| **Overall** | ≥65% | Fail PR if below |

### Coverage Tools

```bash
# Generate coverage report
pnpm test:coverage

# Output
# ✓ Statement coverage: 67%
# ✓ Branch coverage: 62%
# ✓ Function coverage: 71%
# ✓ Line coverage: 66%
#
# Excluded from coverage:
# - React components (CT/E2E only)
# - Page components (E2E only)
# - i18n library wrappers
```

### Flakiness Thresholds

| Test Layer | Acceptable Flakiness | Action |
|------------|----------------------|--------|
| **UT** | <1% | Investigate & fix immediately |
| **CT** | <5% | Analyze; add retries if environmental |
| **E2E** | <10% | Reruns on CI; investigate timeouts |

---

## Test Pyramid Anti-patterns (What NOT to Do)

### Anti-pattern 1: 100% E2E (Current State)

**Problem**:
- Slow feedback (30s per test)
- Brittle selectors (component refactoring breaks tests)
- Hard to debug (which layer failed?)
- Expensive to maintain (100 E2E tests = high CI cost)

**Solution**: Invest in UT layer first (cheap, fast, easy to debug)

### Anti-pattern 2: No E2E Tests

**Problem**:
- Unit tests pass but app is broken (missing integration)
- Prod surprises (mocks don't match real API)
- No real browser testing (responsive, accessibility issues missed)

**Solution**: Maintain E2E tests for critical journeys (8-10 tests)

### Anti-pattern 3: Slow UT Tests

**Problem**:
- Slow unit tests kill dev feedback loop
- Developers skip running tests locally
- Bugs slip through to CI

**Solution**: UT tests must complete in <100ms each; use fast test framework (Vitest)

---

## Related Documents

- [Test Plan](./test-plan.md) — Full E2E scope and approach
- [Coverage Baseline](../04-ut/coverage-baseline.md) — Current state and improvement roadmap
- [Test Pyramid (UT)](../04-ut/pyramid.md) — Unit test layer positioning

