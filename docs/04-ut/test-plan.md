---
title: Unit Test Plan (IEEE 829)
phase: ut
status: active
owner: data-team
last_updated: 2026-05-24
---

# Unit Test Plan (IEEE 829)

## Scope

**Current State**: No unit tests configured. Dashboard relies on E2E testing via Playwright.

**Proposed Scope** (Future Implementation):

Unit testing will cover the **service layer**, **utility functions**, **config objects**, and **simple presentational components** (StatCard, TrendChart). Excludes complex page-level components and react-admin integrations (those remain E2E tested).

| Layer | In Scope | Status |
|-------|----------|--------|
| **Services** | `authProvider`, `dataProvider`, custom hooks | Proposed |
| **Config** | `costConfig`, `environments`, `analytics-config`, `posthog-queries` | Proposed |
| **Contexts** | `EnvironmentContext`, `ContentLanguageContext` | Proposed |
| **Utils & Helpers** | Date formatting, error parsing, unit conversion (sec → min) | Proposed |
| **Components** | Reusable UI (StatCard, TrendChart); NOT page-level pages | Proposed |
| **Page Components** | ReadingStats, Dashboard, Services, etc. | E2E Only |
| **react-admin Integration** | List/Edit/Show views, authProvider auth flow | E2E Only |

---

## Test Items

### 1. Service Layer Tests

#### authProvider.ts
- `login()`: Mocked fetch; verify token storage, success/error handling
- `logout()`: Verify sessionStorage cleanup
- `checkAuth()`: Token present → resolved; absent → rejected
- `checkError()`: 401/403 status → clears token; other → passes through
- `getIdentity()`: Returns user from sessionStorage; handles missing user
- `getPermissions()`: Returns roles array; handles missing user
- **Dev Mode Bypass**: VITE_AUTH_DISABLED=true → auto-login without credentials

#### dataProvider.ts
- `getList()`: Query string construction, pagination, sorting, content language filter header
- `getOne()`: Single item fetch with correct URL
- `getMany()`: Batch fetch with array of IDs
- `create()`: POST with data, returns created object
- `update()`, `updateMany()`: PATCH with partial updates
- `delete()`, `deleteMany()`: DELETE requests
- **Response Parsing**: Handle multiple envelope shapes (items, tickets, feedbacks, data, etc.)
- **Header Construction**: Verify Authorization, X-Admin-Mode, X-Content-Filter headers

#### PostHog Client (if extracted to separate service)
- `query()`: HogQL query POST, response parsing, error handling
- Rate limiting / caching strategies

### 2. Config & Constants

#### environments.ts
- Correct API URL for 'local' vs 'production'
- EnvironmentConfig object shape validation
- ContentFilter type coercion

#### costConfig.ts
- Global budget sum validation
- Service cost structure compliance
- Performance tier ordering (Free < Current < Next)

#### analytics-config.ts
- PostHog project ID and endpoint constants
- Event name mappings complete
- Internal user ID list integrity
- LOCALE_TO_LANGUAGE mapping completeness

#### posthog-queries.ts
- Query template string construction with parameterization
- SQL injection prevention (parameterized queries, not string concat)
- Day/month interval calculations

### 3. Context Tests

#### EnvironmentContext
- Initial environment from localStorage; fallback to 'production'
- `setEnvironment()` persists to localStorage
- `environment-changed` custom event dispatched
- Switching updates apiBaseUrl correctly

#### ContentLanguageContext
- Initial language from sessionStorage; fallback to 'all'
- `setContentLanguage()` persists
- Invalid language rejected

### 4. Component Tests (Reusable)

#### StatCard.tsx
- Renders title, value, optional unit
- Handles missing data gracefully
- Formatting applied (e.g., 1000 → '1,000')

#### TrendChart.tsx
- Recharts ResponsiveContainer rendered
- Data array passed to LineChart
- Color palette applied from brandTokens
- Empty data state

### 5. Utility / Helper Tests

- `convertSecondsToMinutes()`: 60 sec → 1 min, rounding, zero handling
- `formatDate()`: Timezone-aware formatting
- `parseError()`: Extract message/status from fetch error response
- `debounce()`, `throttle()`: Function call timing

---

## Features to be Tested

### High Priority
- **Authentication Flow**: login, logout, permission checks (affects all pages)
- **Data Provider**: CRUD operations, response envelope parsing, error handling
- **Environment Switching**: Local/production toggle, correct API URL routing
- **Cost Config**: Budget calculations, service cost rollups
- **Content Language Filter**: X-Content-Filter header injection, resource filtering

### Medium Priority
- **Analytics Config**: Event definitions, dashboard mapping
- **Context Persistence**: localStorage/sessionStorage behavior
- **Reusable Components**: StatCard, TrendChart edge cases
- **Timezone Handling**: Date conversion, offset calculation

### Low Priority
- **i18n Integration**: Language pack loading (mostly react-admin responsibility)
- **UI Styling**: MUI theme application, color tokens (visual regression → E2E)

---

## Features NOT to be Tested

- **Page-Level Components**: ReadingStatsPage, Dashboard, Services (E2E only due to dependencies on multiple services + UI state)
- **react-admin Integration**: List/Edit/Show resource scaffolding, toolbar actions (E2E)
- **Visual Rendering**: Color application, layout correctness (E2E + screenshot comparison)
- **Browser APIs**: localStorage/sessionStorage impl (test behavior, not browser storage)
- **Network Timing**: Actual HTTP latency, retry logic (E2E with mocked delays)

---

## Approach

### Framework & Tools

- **Test Runner**: Vitest (faster than Jest for ES2020 modules; same syntax)
- **Component Testing**: React Testing Library (userEvent, screen queries)
- **Mocking**: Vitest's `vi.mock()`, `vi.fn()` for modules and functions
- **API Mocking**: MSW (Mock Service Worker) for HTTP interception

### Setup

```
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom msw
```

### Test File Structure

```
src/
  services/
    __tests__/
      authProvider.test.ts       # 10-15 test cases
      dataProvider.test.ts       # 15-20 test cases
      posthogClient.test.ts      # 8-10 test cases
  config/
    __tests__/
      costConfig.test.ts         # 5-7 test cases
      environments.test.ts       # 5-7 test cases
  contexts/
    __tests__/
      EnvironmentContext.test.tsx # 8-10 test cases
  components/
    common/
      __tests__/
        StatCard.test.tsx        # 6-8 test cases
        TrendChart.test.tsx      # 6-8 test cases
  utils/
    __tests__/
      helpers.test.ts            # 10+ test cases
```

### Test Example Pattern

```typescript
// services/__tests__/authProvider.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authProvider } from '../authProvider';

describe('authProvider', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  describe('login()', () => {
    it('should store token in sessionStorage on success', async () => {
      vi.stubGlobal('fetch', vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            accessToken: 'token123',
            user: { id: 'u1', displayName: 'Admin', roles: ['admin'] }
          })
        })
      ));

      await authProvider.login({ username: 'admin@example.com', password: 'pass' });

      expect(sessionStorage.getItem('adminToken')).toBe('token123');
    });

    it('should throw on invalid credentials', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({ ok: false, status: 401 })
      ));

      await expect(
        authProvider.login({ username: 'invalid', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Mocking Strategy

| Target | Tool | Pattern |
|--------|------|---------|
| Fetch API | MSW | Route handler per endpoint |
| localStorage/sessionStorage | Vitest | `beforeEach` clear; test reads/writes |
| PostHog API | MSW | Mock POST /api/projects/312868/query/ |
| React Context | React Testing Library | Wrapper component with Provider |
| Environment variables | Vitest | `process.env.VITE_*` stubs |

---

## Pass/Fail Criteria

### Passing Criteria

- ✓ All unit tests pass (`npm run test` exit code 0)
- ✓ No console errors or warnings during test runs
- ✓ Code coverage ≥ 70% for services, 60% for config, 50% for components
- ✓ No flaky tests (100% pass rate in 3 consecutive runs)
- ✓ Test execution time < 10 seconds (unit layer only)

### Failing Criteria

- ✗ Test failure on any commit (pre-commit hook failure)
- ✗ Coverage drop below baseline (checked in CI)
- ✗ New code without unit tests (flagged in PR review)
- ✗ Mocked API behavior deviates from actual API contract

### Coverage Targets

| Layer | Target | Rationale |
|-------|--------|-----------|
| Services | 70% | High impact; complex logic (auth, API parsing) |
| Config | 80% | Low risk; exhaustive validation |
| Contexts | 60% | Simple state; integration tested via E2E |
| Components | 50% | Visual testing via E2E; focus on logic |
| Utilities | 80% | Pure functions; easy to test |
| **Overall** | 65% | Balanced coverage; E2E covers page-level |

---

## Suspension & Resumption Criteria

### Suspension Conditions (Pause Unit Testing)

- **Blocker Bug**: Critical issue in Vitest setup / MSW preventing test runs (resume after fix)
- **Dependency Conflict**: Package conflict with existing build tools (resolve, then resume)
- **Major Refactor**: Page-level restructuring (pause unit tests, resume after stabilization)

### Resumption Conditions (Resume After Suspension)

- Root cause identified and fixed
- Test setup validated in isolated branch
- PR review for test suite changes completed

---

## Deliverables

### 1. Test Suite (by phase)

| Phase | Deliverable | Timeline |
|-------|-------------|----------|
| **Phase 1** | Service tests (authProvider, dataProvider); config tests | Q3 2026 |
| **Phase 2** | Context tests; utility tests | Q3 2026 |
| **Phase 3** | Component tests (StatCard, TrendChart); integration tests | Q4 2026 |

### 2. CI Integration

- Unit tests run on every PR
- Coverage report published to PR
- Failure blocks merge to main

### 3. Documentation

- Test file README (how to write new tests)
- MSW mock setup guide
- Coverage dashboard (if integrated with CI)

### 4. Tooling

- `npm run test` — Run all tests
- `npm run test:watch` — Watch mode
- `npm run test:ui` — Vitest UI dashboard
- `npm run test:coverage` — Coverage report

---

## Related Documents

- [Coverage Baseline](./coverage-baseline.md) — Current coverage state and improvement plan
- [Test Pyramid](./pyramid.md) — Position of unit tests in overall test strategy
- [E2E Test Plan](../05-ct/test-plan.md) — Playwright integration test scope

