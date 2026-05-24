---
title: Integration Test Plan (IEEE 829)
phase: ct
status: active
owner: data-team
last_updated: 2026-05-24
---

# Integration Test Plan (IEEE 829 - E2E/CT Layer)

## Scope

The Dashboard's **Component Testing (CT) and End-to-End (E2E) layer** focuses on validating complete user workflows and component integration with real browser behavior. This layer is the **primary test coverage** until unit tests are implemented.

### What is Tested

| Feature | Test Files | Status |
|---------|-----------|--------|
| **Reading Stats Analytics** | `reading-stats.spec.ts` | Active |
| **Environment Switching** | `environment.spec.ts` | Active |
| **UI Consistency** | `ui-consistency.spec.ts` | Active |
| **Push Notifications** | `push-notifications.spec.ts` | Active |
| **CRUD Operations** | (planned) | Planned Q3 2026 |
| **Error Handling** | (planned) | Planned Q3 2026 |
| **Cost Management** | (planned) | Planned Q3 2026 |

### What is NOT Tested

- Unit-level service functions (no unit tests; see [UT Plan](../04-ut/test-plan.md))
- Visual regression (no screenshot comparison baseline yet)
- Accessibility (WCAG 2.1 AA not validated; manual testing)
- Multi-browser (only Chromium; Firefox/Safari deferred)
- Mobile responsiveness (desktop only; mobile testing deferred)

---

## Test Items

### 1. Reading Stats Page (`reading-stats.spec.ts`)

**User Journey**: Admin views reading analytics dashboard with multiple tabs

**Test Cases**:
| # | Scenario | Setup | Actions | Assertions |
|---|----------|-------|---------|-----------|
| 1 | Render overview stats with seconds→minutes conversion | Mock API, auth, navigate to /reading-stats | Wait for data load | Displays 12,345 minutes (from 740700 sec) |
| 2 | Display book ranking table | Mock API | (auto-loaded) | Shows "Test Book One", author, 100 min |
| 3 | Switch to categories tab | Mock API | Click category tab button | Displays "Fiction" (60%), "Non-Fiction" (40%) |
| 4 | Switch to time patterns tab | Mock API | Click time patterns tab | Shows hour 20 with 150 min |
| 5 | Handle API 500 error gracefully | Route to return 500 | Load page | Shows "API errors" alert; no crash |
| 6 | Handle empty data (0 sessions) | Mock empty response | Load page | Displays 0 for all metrics; no error |

**API Dependencies**:
- `GET /api/v1/admin/reading-stats/overview` → overview object
- `GET /api/v1/admin/reading-stats/books` → {items: [...], total}
- `GET /api/v1/admin/reading-stats/users` → {items: [...]}
- `GET /api/v1/admin/reading-stats/categories` → {items: [...]}
- `GET /api/v1/admin/reading-stats/time-patterns` → {items: [...]}
- `GET /api/v1/admin/reading-stats/trend` → {items: [...]}

**Success Criteria**:
- ✓ All 6 scenarios pass
- ✓ No page errors (react-admin error page not shown)
- ✓ Responsive within 2000ms of load

---

### 2. Environment Switching (`environment.spec.ts`)

**User Journey**: Admin toggles between local and production environments

**Test Cases**:
| # | Scenario | Setup | Actions | Assertions |
|---|----------|-------|---------|-----------|
| 1 | Default to production environment | (none) | Load page | Production shown in navbar |
| 2 | Switch to local environment | Production active | Click env dropdown; select local | API calls to http://localhost:3000 |
| 3 | Switch back to production | Local active | Click env dropdown; select production | API calls to https://api.readmigo.app |
| 4 | Environment persisted across page reload | Switched to local | Reload page (F5) | Still local; not reverted |
| 5 | Production requires confirmation | Production active | Click dropdown; hover production | Confirmation dialog appears |
| 6 | Cancel confirmation dialog | Dialog shown | Click cancel | Dialog closes; env unchanged |

**Expected Behavior**:
- Local environment: warning color (yellow) in navbar
- Production environment: success color (green) in navbar
- X-Admin-Mode header always sent as 'true'
- API URL changes dynamically; no rebuild required

**Success Criteria**:
- ✓ All 6 scenarios pass
- ✓ localStorage persistence verified
- ✓ API calls routed to correct base URL

---

### 3. UI Consistency (`ui-consistency.spec.ts`)

**User Journey**: Admin navigates across multiple pages and verifies consistent UI elements

**Test Cases**:
| # | Scenario | Pages Visited | Assertions |
|---|----------|---------------|-----------|
| 1 | Navigation sidebar present | Dashboard → Books → Users | Sidebar visible on all pages |
| 2 | Navbar with environment indicator | (all pages) | Env badge shown; color correct |
| 3 | Page titles consistent with sidebar | Dashboard, Books, Users, Reading Stats | Page h1 matches sidebar label |
| 4 | Brand colors applied to buttons | Books, Categories, etc. | Buttons use primary brand color |
| 5 | Table headers readable | Books list, Users list | Headers visible; sortable |
| 6 | Loading indicators shown during fetch | Navigate to pages with data | Skeleton/spinner visible before content |
| 7 | Error alerts follow same style | (all pages with mock error) | Alert color, icon, text consistent |

**Success Criteria**:
- ✓ All 7 scenarios pass
- ✓ No console errors on any page
- ✓ All pages have navigation sidebar

---

### 4. Push Notifications (`push-notifications.spec.ts`)

**User Journey**: Admin composes and sends a push notification

**Test Cases**:
| # | Scenario | Actions | Assertions |
|---|----------|---------|-----------|
| 1 | Load notification composer page | Navigate to /push-notifications | Form with title, message, target fields shown |
| 2 | Fill out notification form | Enter title, message, select target | Form validated; no errors |
| 3 | Send notification | Click send button | Success confirmation; request sent to API |
| 4 | Validate required fields | Click send without title | Error message "Title required" |
| 5 | Show delivery status | After send | "Sent to 150 devices" message shown |
| 6 | Handle send error gracefully | Mock API error 500 | Error message shown; can retry |

**API Dependencies**:
- `POST /api/v1/admin/push-notifications` → {id, sent_count, status}

**Success Criteria**:
- ✓ All 6 scenarios pass
- ✓ Form validation works
- ✓ API call made with correct payload

---

## Environment

### Local Development Environment

**Hardware/OS**:
- macOS, Linux, or Windows with Docker
- Node.js 20.x
- pnpm 8.x or 9.x

**Services**:
- **Dev Server**: `http://localhost:3001` (Vite, HMR enabled)
- **Mock API**: Playwright `route()` interception (no real backend needed)
- **Mock Auth**: sessionStorage with test token (VITE_AUTH_DISABLED=true or auto-inject)

**Startup**:
```bash
# Terminal 1: Start dev server
pnpm dev  # Runs on http://localhost:3001

# Terminal 2: Run tests (auto-starts dev server if CI env not set)
pnpm test  # OR
pnpm test:ui  # Interactive UI
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',  // Trace on failure for debugging
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,  // 2 min to start
  },
});
```

### Test Data & Mocking

**Auth Setup** (injected via `page.addInitScript`):
```javascript
sessionStorage.setItem('adminToken', 'test-token');
sessionStorage.setItem('adminUser', JSON.stringify({
  id: 'test-admin',
  email: 'admin@readmigo.com',
  displayName: 'Test Admin',
  roles: ['admin'],
}));
localStorage.setItem('dashboard_environment', 'production');
```

**API Mocking** (Playwright `page.route`):
```typescript
page.route('**/api/v1/admin/reading-stats/overview', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockOverview),
  });
});
```

**Mock Data Sets**:
- `mockOverview`: Reading stats summary
- `mockBooks`: Book ranking data
- `mockCategories`: Category breakdown
- `mockTrend`: Time-series trend data

---

## Approach

### Test Execution Flow

```
1. Test Framework (Playwright) starts
   ↓
2. Auto-start Vite dev server (http://localhost:3001)
   ↓
3. For each test case:
   a) Launch Chromium browser
   b) Inject auth (sessionStorage)
   c) Setup API mocks (page.route)
   d) Navigate to page
   e) Perform actions (click, fill, etc.)
   f) Assert outcomes (text content, network calls, UI state)
   g) Screenshot on failure
   h) Close browser
   ↓
4. Report results (HTML report, exit code)
```

### Test Writing Pattern

```typescript
import { test, expect } from '@playwright/test';

function setupAuth(page) {
  return page.addInitScript(() => {
    sessionStorage.setItem('adminToken', 'test-token');
    sessionStorage.setItem('adminUser', JSON.stringify({
      id: 'test-admin',
      email: 'admin@readmigo.com',
      displayName: 'Test Admin',
      roles: ['admin'],
    }));
  });
}

function setupMockRoutes(page) {
  return Promise.all([
    page.route('**/api/v1/admin/reading-stats/overview', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify(mockData) });
    }),
  ]);
}

test.describe('Feature Name', () => {
  test('should display data correctly', async ({ page }) => {
    await setupAuth(page);
    await setupMockRoutes(page);
    
    await page.goto('/page-path');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    expect(content).toContain('Expected Text');
  });
});
```

### Assertion Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `expect(content).toContain('text')` | Text presence | Verify stat value |
| `page.getByRole()` | Semantic element | Find button by label |
| `page.waitForLoadState()` | Wait for network | Wait for data fetch |
| `page.screenshot()` | Visual capture | Debug on failure |
| `expect(response.status()).toBe(200)` | Network validation | Verify API called |

---

## Pass/Fail Criteria

### Passing Test

✓ All assertions pass
✓ No page errors (react-admin error page NOT shown)
✓ No console errors (except warnings)
✓ Network calls made to correct endpoints
✓ Response mocks matched correctly

**Example**:
```
✓ reading-stats.spec.ts (6 tests)
  ✓ should render overview stats correctly with seconds-to-minutes conversion
  ✓ should render book ranking table
  ✓ should render categories tab correctly
  ✓ should render time patterns tab correctly
  ✓ should handle API errors gracefully without crashing
  ✓ should handle empty data gracefully
```

### Failing Test

✗ Assertion fails (expected "12,345" but got "740700")
✗ Page navigation timeout (30s wait exceeded)
✗ Unhandled exception (react-admin error page shown)
✗ API mock not matched (request to unmocked endpoint)
✗ Selector not found (button/input disappeared)

**Debugging Failed Test**:
```bash
# Re-run with trace
pnpm test --grep "specific test" --debug

# Open HTML report
npx playwright show-report

# Inspect trace file (Playwright Inspector)
```

---

## Deliverables

### 1. Test Suite Files

| File | Status | Test Count |
|------|--------|-----------|
| `tests/reading-stats.spec.ts` | ✓ Active | 6 |
| `tests/environment.spec.ts` | ✓ Active | 6 |
| `tests/ui-consistency.spec.ts` | ✓ Active | 7 |
| `tests/push-notifications.spec.ts` | ✓ Active | 6 |
| `tests/crud-operations.spec.ts` | Planned Q3 | 8 |
| `tests/error-handling.spec.ts` | Planned Q3 | 5 |
| `tests/cost-management.spec.ts` | Planned Q3 | 5 |
| **Total** | | **43 tests** |

### 2. Test Reports

- **HTML Report**: `test-results/index.html` (visual, per-browser)
- **JUnit Report**: `test-results/junit.xml` (CI integration)
- **Screenshots**: `tests/screenshots/` (on-failure captures)

### 3. CI Integration

- **Run Command**: `pnpm test` (auto-start dev server)
- **Timeout**: 5 minutes per test file
- **Retries**: 2 retries on CI; 0 on local
- **Parallel**: 1 worker on CI (stability); unlimited on local

### 4. Documentation

- Test writing guide (example patterns, mock helpers)
- Troubleshooting guide (common failures, debug tips)
- Mock data reference (schema and values)

---

## Related Documents

- [E2E Scenarios](./e2e-scenarios.md) — Detailed user journey descriptions
- [Contract Testing](./contract-testing.md) — Cross-repo API validation
- [Test Pyramid](./pyramid.md) — Positioning E2E in overall test strategy
- [Unit Test Plan](../04-ut/test-plan.md) — Unit layer coverage (future)

