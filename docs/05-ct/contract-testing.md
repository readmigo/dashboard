---
title: Cross-repo Contract Testing (PACT-style)
phase: ct
status: active
owner: data-team
last_updated: 2026-05-24
---

# Cross-repo Contract Testing (PACT-style)

## Counterpart Repos

### Producer Repos (Provide APIs)

| Repo | API | Responsibility | Owner | Status |
|------|-----|---|---|---|
| [readmigo/api](https://github.com/readmigo/api) | REST /api/v1/admin/* | CRUD for books, users, stats, etc. | backend-team | Active |
| PostHog Cloud | HogQL /api/projects/312868/query/ | Analytics event queries | PostHog SaaS | External |

### Consumer Repos (Use APIs)

| Repo | Consumes | Purpose | Owner | Status |
|------|----------|---------|-------|--------|
| [readmigo/dashboard](https://github.com/readmigo/dashboard) | REST API + PostHog HogQL | Admin panel | data-team | Active |

---

## Contract File Locations

### REST API Contract

**Location**: `readmigo/api` repository

| File | Scope | Content |
|------|-------|---------|
| `docs/api/admin.md` | Admin endpoints | `/api/v1/admin/*` schemas |
| `src/api/routes/admin/` | Implementation | Express route handlers |
| `tests/integration/admin.spec.ts` | Tests | API contract validation |
| `CHANGELOG.md` | Versions | Breaking changes log |

**Example Contract**:
```yaml
Endpoint: GET /api/v1/admin/books
Query Params:
  - page: number (default 1)
  - limit: number (default 10)
  - sortBy: string (default 'id')
  - sortOrder: 'ASC' | 'DESC'
  - contentLanguage: 'en' | 'zh' | 'all'

Response (200):
  {
    items: [{
      id: string,
      title: string,
      author: string,
      createdAt: ISO8601,
      updatedAt: ISO8601
    }],
    total: number
  }

Error (401):
  { message: "Unauthorized" }
```

### PostHog Contract

**Location**: PostHog Cloud / docs

| Resource | Contract | Validation |
|----------|----------|-----------|
| Event List | [Event Definitions API](https://posthog.com/docs/api/event-definitions) | EventType enum in config |
| Query API | [HogQL Reference](https://posthog.com/docs/hogql) | Query syntax validation |
| Dashboard | [Dashboard API](https://posthog.com/docs/api/dashboards) | Dashboard ID reference (1329200, etc.) |

**Example Contract**:
```yaml
Event: audiobook_play_started
Properties:
  - audiobook_source: 'librivox' | 'tts_v3'
  - voice_id: string | null
  - is_resume: boolean

Query:
  SELECT COUNT() as sessions
  FROM events
  WHERE event = 'audiobook_play_started'
  AND properties.audiobook_source = 'tts_v3'
```

---

## Producer / Consumer Matrix

### Request-Response Flow

```
Dashboard (Consumer)                  API (Producer)
─────────────────────                ──────────────
  1. GET /api/v1/admin/books?page=1
     Headers: Authorization, X-Admin-Mode, X-Content-Filter
     ────────────────────────────────>
  
  2. (Router: /admin/books handler)
     (Middleware: auth check, content filter)
     (DB: SELECT * FROM books WHERE ...)
     
  3. JSON Response:
     { items: [...], total: 42 }
     <────────────────────────────────
     
  4. dataProvider.getList() parses response
  5. React component renders books table
```

### Contract Validation Points

| Point | Producer | Consumer | Validation |
|-------|----------|----------|-----------|
| **Endpoint Exists** | API server | Dashboard tests | 200 OK response (not 404) |
| **Response Shape** | API schema | Playwright mock setup | { items: [...], total } |
| **Field Presence** | API response | Component mapping | `response.items[0].id` exists |
| **Field Types** | API (JSON) | TypeScript | `id: string`, `createdAt: string` |
| **Enum Values** | API | Dashboard | `contentLanguage: 'en'\|'zh'\|'all'` |
| **Headers** | API (requires) | Dashboard (sends) | `Authorization: Bearer ...` |
| **Pagination** | API (limit, page) | Dashboard query | `page=1&limit=10` sent |
| **Status Codes** | API | Dashboard tests | 200 (success), 401 (auth), 404 (missing) |

### Break Points (When Contract Breaks)

| Scenario | Impact | Detection |
|----------|--------|-----------|
| **API endpoint deleted** | Dashboard requests 404 | E2E test fails (no mock match) |
| **Response field renamed** | Dashboard displays blank/undefined | E2E test + component visual check |
| **Field type changed** | TypeScript error or runtime bug | Type checking (strict mode) |
| **New required param** | API rejects request (400) | Unit test of dataProvider |
| **Auth header format changed** | 401 Unauthorized | E2E auth test fails |
| **Pagination limit increased** | Unexpected behavior (might work) | Manual testing + E2E with large data |

---

## CI Integration

### Cross-repo Validation Workflow

**Goal**: Prevent dashboard from breaking when API changes.

### Phase 1: E2E Testing (Current)

Dashboard tests run against **mocked API responses** (Playwright `route.fulfill`). No real API calls → no detection of API breaks.

**Current Setup**:
```yaml
# .github/workflows/test.yml (Dashboard)
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test  # Playwright E2E with mocks
```

**Limitation**: Mock data may become stale if API changes.

---

### Phase 2: Integration Tests (Planned Q3 2026)

Dashboard runs **real API calls** against a test instance of the API server.

**Setup**:
```yaml
# .github/workflows/integration-test.yml (Dashboard)
on: [push, pull_request]
jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      api:
        image: readmigo/api:test  # Test build of API
        ports:
          - 3000:3000
        env:
          DATABASE_URL: postgresql://test:test@postgres:5432/test
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:integration  # Real API calls
```

**Benefit**: Catches actual API contract breaks before production.

---

### Phase 3: Contract Testing (Planned Q4 2026)

Use PACT or OpenAPI specs to enforce strict contract validation.

**Option A: PACT (Consumer-Driven)**

```bash
# Generate PACT contracts from Dashboard tests
pnpm test -- --pact

# Upload contracts to PACT broker
pact-broker publish pacts --consumer dashboard --version 0.1.0

# API repo can-i-deploy check
pact-broker can-i-deploy --pacticipant api --version 1.0.0
```

**Option B: OpenAPI / Swagger**

```yaml
# API provides OpenAPI spec: /api/openapi.json
# Dashboard validates against spec before each request
openapi: 3.0.0
paths:
  /api/v1/admin/books:
    get:
      parameters:
        - name: page
          schema: { type: integer }
      responses:
        200:
          schema: { $ref: '#/components/schemas/BookList' }
```

---

## Versioning & Breaking Changes

### API Versioning Strategy

| Version | Path | Support | Deprecation |
|---------|------|---------|-------------|
| **v1** | `/api/v1/admin/*` | Active | 2027-06-01 |
| **v2** | `/api/v2/admin/*` | (planned) | 2027-12-01 |

### Breaking Change Policy

**Before Breaking Change**:
1. Feature branch in API repo; tested against current Dashboard version
2. PR review; document breaking change in `BREAKING_CHANGES.md`
3. Create new endpoint (e.g., `/api/v2/*`) with new schema
4. Deprecation notice in API docs (v1 support until date X)

**API Repo**:
```yaml
# BREAKING_CHANGES.md
## v2.0.0 (2026-07-01)

### Changed
- `GET /api/v1/admin/books` response: `totalReadingSeconds` renamed to `readingDurationSeconds`

### Migration
Dashboard should update:
- dataProvider response parsing
- component field mappings
```

**Dashboard Repo**:
```typescript
// In dataProvider.ts, handle both versions
const data = response.totalReadingSeconds || response.readingDurationSeconds;
```

**Merge Order**:
1. API v2 merged (v1 still supported)
2. Dashboard updated to consume v2
3. API deprecates v1 (gives warning)
4. After deprecation window, API removes v1

---

## Mock Data Management

### Sync Mock Data with API Contract

**Problem**: Playwright mocks can become stale.

**Solution**: Generate mocks from API schema / actual responses.

```bash
# 1. Fetch real API response during development
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/v1/admin/books > tests/mocks/books.json

# 2. Use in Playwright test
import mockBooks from './mocks/books.json';

page.route('**/api/v1/admin/books*', (route) => {
  route.fulfill({ body: JSON.stringify(mockBooks) });
});

# 3. Version control mocks; update when API contract changes
git add tests/mocks/
git commit -m "chore: update mock data to match API v1.2.0"
```

### Mock Data Versioning

```
tests/
  mocks/
    api@1.0.0/
      books.json
      users.json
      reading-stats.json
    api@1.1.0/
      books.json  # Field 'authorId' added
      ...
    posthog@1.0.0/
      events.json
```

---

## Testing the Integration

### Integration Test Example

```typescript
// tests/integration/api-contract.spec.ts
import { test, expect } from '@playwright/test';

// Test against REAL API (not mocked)
test.describe('API Contract', () => {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  
  test('books endpoint returns expected schema', async () => {
    const response = await fetch(`${apiUrl}/api/v1/admin/books`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN}`,
        'X-Admin-Mode': 'true',
        'X-Content-Filter': 'all',
      },
    });
    
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.items)).toBe(true);
    
    // Validate item schema
    if (body.items.length > 0) {
      const item = body.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('author');
      expect(item).toHaveProperty('createdAt');
    }
  });
});
```

---

## Related Documents

- [Test Plan](./test-plan.md) — Full scope of E2E testing
- [E2E Scenarios](./e2e-scenarios.md) — User journeys and mock setup
- [API Documentation](https://docs.readmigo.app/03-architecture) — REST API contract definition
- [Design Language](../03-sdd/design-language.md) — Type and schema definitions

