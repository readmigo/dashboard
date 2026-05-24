---
title: Coverage Baseline
phase: ut
status: active
owner: data-team
last_updated: 2026-05-24
---

# Coverage Baseline

## Current Coverage

| Layer | Statement | Branch | Function | Line | Tools |
|-------|-----------|--------|----------|------|-------|
| **Unit (UT)** | 0% | 0% | 0% | 0% | None configured |
| **Component Tests (CT)** | 0% | 0% | 0% | 0% | None configured |
| **E2E (Playwright)** | ~40%* | ~25%* | ~50%* | ~40%* | Playwright (4 spec files) |
| **Overall** | ~15% | ~7% | ~18% | ~15% | E2E only |

*Estimated from code paths exercised by 4 E2E test files (reading-stats.spec.ts, environment.spec.ts, ui-consistency.spec.ts, push-notifications.spec.ts). No actual coverage metrics collected.

### Gap Analysis

**Untested Code Paths**:
- `authProvider.ts` error cases (401, 403, network failures)
- `dataProvider.ts` response envelope parsing (tickets, feedbacks, orders variants)
- `costConfig.ts` service cost rollups and budget calculations
- `EnvironmentContext.tsx` localStorage persistence edge cases
- Utility functions (date formatting, error parsing, unit conversion)
- Most component props combinations (StatCard missing data, TrendChart with 0 points, etc.)

**Why E2E Isn't Sufficient**:
- E2E tests use mocked API responses (via Playwright `route.fulfill`); real error conditions not validated
- Long feedback loop (E2E takes 30-60 seconds; unit tests < 100ms)
- Flaky selectors: Changing component internals can break tests without changing actual behavior
- No isolation: Bug in service layer or component both cause same E2E failure (hard to pinpoint)

---

## Baseline Target

### Target Coverage Goals

| Layer | Target | Justification | Timeline |
|-------|--------|---------------|----------|
| **Services** (authProvider, dataProvider) | 70% | High impact; complex logic; easy to test | Q3 2026 |
| **Config** (costConfig, environments, analytics-config) | 80% | Low risk; exhaustive validation | Q3 2026 |
| **Contexts** | 60% | Simple state logic; E2E covers integration | Q3 2026 |
| **Utils/Helpers** | 80% | Pure functions; no side effects | Q3 2026 |
| **Reusable Components** | 50% | Focus on logic paths; visual tested via E2E | Q4 2026 |
| **Page Components** (ReadingStats, Dashboard, etc.) | 0% | Tested via E2E only (complex deps) | Ongoing |
| **Overall** | 65% | Balanced approach; not 100% (cost/benefit diminishing) | Q4 2026 |

### Phase-wise Rollout

**Phase 1 (Q3 2026, Weeks 1-3)**:
- Vitest + MSW setup
- authProvider.test.ts (10-15 cases)
- dataProvider.test.ts (15-20 cases)
- Achieve 50% overall coverage

**Phase 2 (Q3 2026, Weeks 4-6)**:
- Config tests (costConfig, environments, analytics-config)
- Context tests (EnvironmentContext, ContentLanguageContext)
- Utility tests
- Achieve 60% overall coverage

**Phase 3 (Q4 2026)**:
- Component tests (StatCard, TrendChart)
- Integration tests between contexts + services
- Achieve 65% overall coverage

---

## Improvement Plan

### 1. Unit Test Infrastructure (Week 1)

**Install tooling**:
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom msw happy-dom
pnpm add -D @types/node
```

**Create test setup files**:
- `vitest.config.ts` — ESM config, globals, setup file
- `src/test/setup.ts` — MSW handlers, beforeEach hooks
- `src/test/utils.ts` — Custom render function, mock helpers

**CI integration**:
- Add `npm run test` to GitHub Actions workflow
- Coverage reports published to PR

### 2. Service Layer Tests (Weeks 2-3)

**authProvider.test.ts** (15 tests):
- login() success and error paths
- logout() cleanup
- checkAuth() token present/absent
- checkError() 401/403 handling
- getIdentity() with/without token
- getPermissions() role extraction
- Dev mode bypass (VITE_AUTH_DISABLED)

**dataProvider.test.ts** (20 tests):
- getList() pagination, sorting, filtering
- getOne() single item fetch
- getMany() batch fetch
- create() POST
- update() / updateMany() PATCH
- delete() / deleteMany() DELETE
- Response envelope parsing (items, tickets, feedbacks, orders, data variants)
- Header construction (Authorization, X-Admin-Mode, X-Content-Filter)
- Error handling and logging

**posthogClient.test.ts** (10 tests, if extracted):
- query() POST to /api/projects/{id}/query/
- Response parsing
- Error handling
- Rate limiting / caching (if applicable)

### 3. Config & Context Tests (Weeks 4-5)

**costConfig.test.ts** (7 tests):
- Global budget >= sum of service budgets
- Service cost array structure validation
- Performance tier ordering
- Category icon names valid

**environments.test.ts** (6 tests):
- getApiUrl('local') returns correct URL
- getApiUrl('production') returns correct URL
- EnvironmentConfig shape validation
- ContentFilter type validation

**EnvironmentContext.test.tsx** (10 tests):
- Initial state from localStorage
- setEnvironment() persists
- custom event 'environment-changed' dispatched
- apiBaseUrl updates correctly
- Provider error when used outside context

**ContentLanguageContext.test.tsx** (8 tests):
- Initial state from sessionStorage
- setContentLanguage() validates enum
- Persistence across reloads
- Error on invalid language

### 4. Utilities & Components (Weeks 6-8)

**helpers.test.ts** (12 tests):
- convertSecondsToMinutes(0) = 0, (60) = 1, (3660) = 61
- formatDate() with timezone offset
- parseError() extracts message and status
- debounce() call timing
- throttle() call limiting

**StatCard.test.tsx** (8 tests):
- Renders title, value, unit
- Handles null/undefined data
- Applies formatting (1000 → '1,000')
- Optional subtitle
- Loading state

**TrendChart.test.tsx** (8 tests):
- ResponsiveContainer rendered
- Data passed to LineChart
- Color palette from brandTokens
- Empty data state
- Tooltip customization

### 5. Documentation & CI Integration (Week 9)

- Test writing guide: how to write unit tests for new features
- MSW handler registration guide
- Coverage dashboard setup (Codecov or similar)
- Pre-commit hook: run tests before commit

---

## Tools & Commands

### Setup Commands

```bash
# Install dev dependencies
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom msw happy-dom

# Initialize Vitest config
npx vitest init

# Run tests (first time)
pnpm test
```

### Test Commands

| Command | Purpose |
|---------|---------|
| `pnpm test` | Run all unit tests once |
| `pnpm test:watch` | Run in watch mode (re-run on file change) |
| `pnpm test:ui` | Open interactive Vitest UI on http://localhost:51204 |
| `pnpm test:coverage` | Generate coverage report (HTML, JSON, text) |
| `pnpm test -- --reporter=verbose` | Verbose output (all test names) |
| `pnpm test authProvider.test` | Run single file |
| `pnpm test -- --grep "login"` | Run tests matching pattern |

### Coverage Report

```bash
pnpm test:coverage
# Generates:
# - coverage/index.html (visual report)
# - coverage/coverage-final.json (CI integration)
# - Text summary in console
```

### CI Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3
        with: { files: './coverage/coverage-final.json' }
```

### Local Development Workflow

```bash
# 1. Start dev server
pnpm dev

# 2. In another terminal, run tests in watch mode
pnpm test:watch

# 3. Write code and tests; save to auto-run

# 4. Before committing, run full test + coverage
pnpm test:coverage
pnpm lint
```

### Vitest Configuration Example

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',  // or 'jsdom' for DOM APIs
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ]
    }
  }
});
```

---

## Coverage Tracking & Metrics

### Baseline Snapshot (2026-05-24)

Before any unit test implementation:
- Total lines of code: ~3500 (estimated)
- Testable lines: ~2800 (services, config, utils; excluding JSX)
- Currently covered: ~400 lines (E2E indirect) = **14% baseline**

### Success Metrics (Q4 2026)

- Unit tests: 200+ test cases
- Services coverage: 70%
- Config coverage: 80%
- Total project coverage: 65%
- Test execution: < 10 seconds
- No test flakiness: 100% pass rate on CI

### Related Documents

- [Test Plan](./test-plan.md) — Detailed scope and approach
- [Test Pyramid](./pyramid.md) — Layer positioning and ratio targets
- [E2E Test Plan](../05-ct/test-plan.md) — Integration layer details

