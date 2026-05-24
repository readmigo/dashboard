---
title: E2E Scenarios (User Journeys)
phase: ct
status: active
owner: data-team
last_updated: 2026-05-24
---

# E2E Scenarios (User Journeys)

## Key User Journeys

### Journey 1: View Reading Analytics Dashboard

**Actor**: Operations Manager

**Goal**: Monitor reading activity trends and identify popular content

**Happy Path**:
1. Admin auto-authenticates (VITE_AUTH_DISABLED=true in dev)
2. Navigates to `/reading-stats`
3. Sees overview stats (total minutes, active readers, total sessions)
4. Clicks "Books" tab → views ranked books by reading time
5. Clicks "Categories" tab → sees category breakdown (Fiction 60%, Non-Fiction 40%)
6. Clicks "Time Patterns" tab → observes peak reading hours (8am, 12pm, 8pm)
7. Views trend chart showing daily reading progression
8. Validates all seconds converted to minutes display

**Errors Handled**:
- API 500 error → Alert shown "API errors"; Retry button available
- Empty data (0 sessions) → Graceful UI with "No data" message
- Network timeout → Retry logic with exponential backoff

**Expected Time**: < 3 seconds to load all tabs

---

### Journey 2: Switch Admin Environment

**Actor**: QA Engineer / Dev Administrator

**Goal**: Test dashboard against local or production API without rebuilding

**Happy Path**:
1. Dashboard loads in Production environment (green indicator)
2. Admin opens environment switcher dropdown in navbar
3. Selects "Local" → confirmation dialog appears (optional for local)
4. Confirms selection
5. Dashboard re-fetches data from `http://localhost:3000` instead of `https://api.readmigo.app`
6. Page reloads with same data (using local mock API)
7. Toggles back to Production
8. Confirmation dialog required for production; confirms
9. API calls now go to production endpoint

**Environment Indicators**:
- **Local**: Yellow warning badge; no confirmation needed
- **Production**: Green success badge; confirmation dialog required for mutations

**Persistence**: Environment choice saved to localStorage; persists across page reloads

**Expected Time**: < 1 second per environment switch

---

### Journey 3: Send Push Notification

**Actor**: Marketing Manager

**Goal**: Compose and send platform-wide notification to users

**Happy Path**:
1. Admin navigates to `/push-notifications`
2. Sees form with fields: Title, Message, Target Audience, Scheduled Time
3. Fills in:
   - Title: "Summer Reading Challenge"
   - Message: "Join our summer reading challenge and win rewards!"
   - Target: "All Users"
   - Schedule: Immediate
4. Clicks "Send" button
5. Form validates (all required fields present)
6. API call: `POST /api/v1/admin/push-notifications`
7. Success response: "Sent to 2,145 devices"
8. Notification logged in history below form

**Error Cases**:
- Missing title → "Title is required" validation error
- API 500 → "Failed to send. Retry?" message with retry button
- Invalid email in target → "Invalid email format"

**Expected Time**: < 2 seconds to send

---

### Journey 4: CRUD Book Resource (Planned Q3)

**Actor**: Content Manager

**Goal**: Create, view, edit, and delete book records

**Scenarios**:
1. **List Books**: Navigate to `/books` → table of all books with pagination
2. **Create Book**: Click "Create" → fill form → submit → redirected to show page
3. **Edit Book**: Click book row → edit form → update fields → save → confirm
4. **Delete Book**: Click delete icon → confirmation → delete → list refreshed
5. **View Details**: Click book → show page with all details + reading stats

**Expected Time**: 1-2 seconds per operation

---

### Journey 5: Error Handling (Planned Q3)

**Actor**: QA / Troubleshooter

**Goal**: Verify dashboard handles errors gracefully without crashing

**Scenarios**:
1. **API 500 Error**: Mock API returns 500 → Alert shown; no app crash
2. **Network Timeout**: API endpoint slow; request times out → Retry button
3. **401 Unauthorized**: Token expired → Logout; redirect to login
4. **Invalid JSON**: API returns malformed JSON → Error alert; no crash
5. **Missing Required Fields**: Form submit without required field → Validation error

**Expected Outcome**: All errors displayed to user; no white screen of death

---

## Scenario Matrix

### Coverage by Feature Area

| Feature | Scenario | Journey | Test File | Status |
|---------|----------|---------|-----------|--------|
| **Analytics** | View stats & tabs | #1 | reading-stats.spec.ts | ✓ Active |
| **Environment** | Switch env + persist | #2 | environment.spec.ts | ✓ Active |
| **Notifications** | Send notification | #3 | push-notifications.spec.ts | ✓ Active |
| **UI Consistency** | Navigation & styling | (implicit) | ui-consistency.spec.ts | ✓ Active |
| **CRUD Books** | Create, read, update, delete | #4 | crud-operations.spec.ts | Planned |
| **Error Handling** | API errors, validation | #5 | error-handling.spec.ts | Planned |
| **Cost Mgmt** | Budget tracking, alerts | (new) | cost-management.spec.ts | Planned |

### Test Execution Matrix

| Environment | Browser | Orientation | Status | Timeline |
|-------------|---------|-------------|--------|----------|
| **Local (dev)** | Chromium | Desktop | ✓ Current | Ongoing |
| **Production** | Chromium | Desktop | ✓ Current | Ongoing |
| **Firefox** | Firefox | Desktop | Planned | Q4 2026 |
| **Safari** | Safari | Desktop | Planned | Q4 2026 |
| **Mobile** | Chrome Android | Mobile | Planned | Q1 2027 |

---

## Execution Commands

### Run All Tests

```bash
# Run all E2E tests (auto-starts dev server)
pnpm test

# Run with UI dashboard
pnpm test:ui

# Run specific test file
pnpm test reading-stats.spec.ts

# Run specific test by name
pnpm test -g "should render overview stats"

# Run with debug info
pnpm test --debug

# Run with headed browser (see browser window)
pnpm test --headed

# Run with trace (detailed playback)
pnpm test --trace on
```

### Test Output Examples

```
$ pnpm test

  running 4 tests from 4 files

  tests/reading-stats.spec.ts (6)
    ✓ should render overview stats correctly with seconds-to-minutes conversion (2.3s)
    ✓ should render book ranking table with seconds converted to minutes (1.8s)
    ✓ should render categories tab correctly (0.9s)
    ✓ should render time patterns tab correctly (0.8s)
    ✓ should handle API errors gracefully without crashing (1.5s)
    ✓ should handle empty data gracefully (0.9s)

  tests/environment.spec.ts (6)
    ✓ should default to production environment (0.5s)
    ✓ should switch to local environment (0.7s)
    ✓ should switch back to production (0.6s)
    ✓ should persist environment across page reload (1.2s)
    ✓ should require confirmation for production (0.8s)
    ✓ should cancel confirmation dialog (0.6s)

  tests/ui-consistency.spec.ts (7)
    ✓ should have sidebar on all pages (0.4s)
    ✓ should show environment indicator (0.3s)
    ✓ should have page titles (0.4s)
    ✓ should apply brand colors (0.5s)
    ✓ should have readable table headers (0.6s)
    ✓ should show loading indicators (0.7s)
    ✓ should show error alerts (0.8s)

  tests/push-notifications.spec.ts (6)
    ✓ should load composer page (0.9s)
    ✓ should fill and validate form (1.2s)
    ✓ should send notification (1.5s)
    ✓ should validate required fields (0.7s)
    ✓ should show delivery status (0.6s)
    ✓ should handle send error gracefully (1.1s)

  ✓ 25 passed (28 files checked in 32.2s)

  To show the HTML report, run
    npx playwright show-report
```

### View Test Results

```bash
# Open HTML report (browser)
npx playwright show-report

# View specific trace file (Playwright Inspector)
npx playwright show-trace test-results/reading-stats-01/trace.zip

# List all test files
pnpm test --list

# Dry run (no execution, just listing)
pnpm test --list
```

### CI/CD Integration

```bash
# GitHub Actions: Run tests on PR
pnpm test --reporter=github

# Generate JUnit XML for CI systems
pnpm test --reporter=junit

# Fail on warnings
pnpm test --strict

# Run with specific timeout
pnpm test --timeout=60000  # 60 seconds per test
```

### Development Workflow

```bash
# Terminal 1: Start dev server
pnpm dev
# Opens http://localhost:3001, watches for changes, HMR enabled

# Terminal 2: Run tests in watch mode
pnpm test -- --watch

# Make code changes → auto-rerun affected tests

# When ready to commit:
pnpm test  # Full run once
pnpm lint
git add .
git commit -m "..."
```

### Performance Profiling

```bash
# Measure test execution time
time pnpm test

# Expected breakdown:
#   Dev server startup:  5-8 seconds
#   Test execution:      20-30 seconds
#   Total:               25-38 seconds

# Profile specific test
pnpm test reading-stats.spec.ts --reporter=verbose
```

### Debugging Failed Tests

```bash
# Run failed test with visible browser
pnpm test --headed --grep "should render overview"

# Open debug inspector (pauses browser)
pnpm test --debug

# View network calls in trace
npx playwright show-trace test-results/{test-name}/trace.zip

# Print all console messages during test
PLAYWRIGHT_PRINT_CONSOLE=1 pnpm test
```

---

## Test Data & Mock API

### Reading Stats Mock Data

```typescript
const mockOverview = {
  totalReadingSeconds: 740700,     // 12,345 minutes
  totalSessions: 567,
  activeReaders: 89,
  booksBeingRead: 34,
  averageSessionDuration: 1320,    // 22 minutes
  averageDailySeconds: 2700,       // 45 minutes daily
};
```

### Mock Response Envelopes

```typescript
// List responses
{ items: [...], total: N }

// Single resource
{ id, createdAt, updatedAt, ... }

// Analytics overview
{ totalReadingSeconds, totalSessions, ... }
```

---

## Related Documents

- [Test Plan](./test-plan.md) — Full scope, pass/fail criteria, deliverables
- [Contract Testing](./contract-testing.md) — Cross-repo API validation
- [Test Pyramid](./pyramid.md) — Positioning E2E in overall test strategy

