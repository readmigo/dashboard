---
title: Design Language (Types / Schemas / Contracts)
phase: sdd
status: active
owner: data-team
last_updated: 2026-05-24
---

# Design Language (Types / Schemas / Contracts)

## Type Definitions

### Core Application Types

```typescript
// Environment switching
type Environment = 'local' | 'production';

interface EnvironmentConfig {
  name: string;           // 'Local' | 'Production'
  apiUrl: string;         // 'http://localhost:3000' | 'https://api.readmigo.app'
  contentStudioUrl: string;
  color: 'warning' | 'info' | 'success';  // UI indicator color
  description: string;
  requireConfirmation?: boolean;  // true for production mutations
}

// Content language filtering
type ContentFilter = 'all' | 'en' | 'zh';

// Authentication context
interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];        // 'admin', 'moderator', etc.
  avatarUrl?: string;
}

interface AuthToken {
  accessToken: string;
  user: AdminUser;
}

// Cost tracking
type CostCategory = 'compute' | 'database' | 'cache' | 'storage' | 'monitoring' | 'other';
type CostClassification = 'infrastructure' | 'devtool';

interface ServiceCost {
  id: string;             // 'api-server', 'postgresql', etc.
  name: string;           // Display name
  category: CostCategory;
  classification: CostClassification;
  provider: string;       // 'Fly.io', 'Neon', 'Sentry', etc.
  monthlyBudget: number;  // USD
  costs: { month: string; actual: number }[];  // Historical costs
  url?: string;           // Service dashboard link
  note?: string;
  sourceDoc?: string;     // Ref to ops docs
  freeTier?: {
    isOnFreeTier: boolean;
    description: string;
  };
  performanceTiers?: {
    name: string;         // 'Free', 'Current', 'Next'
    monthlyCost: number;
    description: string;
  }[];
}
```

### Reading Stats Data Types

```typescript
interface ReadingOverview {
  totalReadingSeconds: number;  // Cumulative reading duration
  totalSessions: number;         // Number of reading sessions
  activeReaders: number;         // Unique users with sessions
  booksBeingRead: number;        // Distinct books in sessions
  averageSessionDuration: number; // Seconds per session
  averageDailySeconds: number;   // Daily average reading time
}

interface BookRanking {
  rank: number;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  totalReadingSeconds: number;
  uniqueReaders: number;
  totalSessions: number;
  averageSecondsPerReader: number;
}

interface ReadingTrendEntry {
  date: string;                  // YYYY-MM-DD
  totalSeconds: number;
  sessionsCount: number;
  activeUsers: number;
  averageSecondsPerUser: number;
}

interface TimePatternEntry {
  hour: number;                  // 0-23
  totalSeconds: number;
  sessionsCount: number;
  uniqueUsers: number;
}
```

---

## Schema Definitions

### REST API Response Envelopes

The dashboard consumes multiple response shapes from the backend API:

| Resource | Envelope Shape | Example |
|----------|---|---|
| `books`, `users`, `authors`, `categories`, `quotes` | `{ items: [...], total: number }` | See REST example below |
| `reading-stats/overview` | Direct object | `{ totalReadingSeconds, totalSessions, activeReaders, ... }` |
| `reading-stats/books` | `{ items: [...], total: number }` | Array of BookRanking |
| `reading-stats/trend` | `{ items: [...], total: number }` | Array of ReadingTrendEntry |
| `tickets` | `{ tickets: [...], total: number }` | Support tickets array |
| `feedback` | `{ feedbacks: [...], total: number }` | User feedback array |
| `orders` | `{ orders: [...], total: number }` | Transaction array |

### PostHog Query Template Structure

```typescript
interface HogQLQuery {
  kind: 'HogQLQuery';
  query: string;  // SELECT ... FROM events WHERE ...
}

interface HogQLRequest {
  query: HogQLQuery;
}

interface HogQLResponse {
  results: Array<Record<string, any>>;  // Rows
  timings: {
    query_time?: number;
    total_time?: number;
  };
}
```

**Example HogQL Query** (from `src/config/posthog-queries.ts`):
```sql
SELECT toDate(timestamp) as day,
       count(DISTINCT distinct_id) as dau
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
  AND event NOT IN ('$set')
GROUP BY day
ORDER BY day
```

### Cost Config Schema

```typescript
interface CostConfig {
  globalMonthlyBudget: number;     // $400/month total
  categories: Array<{
    id: CostCategory;
    label: string;
    icon: string;                  // MUI icon name
  }>;
  services: ServiceCost[];
}
```

**Current Breakdown** (13 services):
- Compute: Fly.io (API), DigitalOcean (Job Server)
- Database: Neon (PostgreSQL)
- Storage: Cloudflare (R2, DNS, CDN)
- Monitoring: Sentry, PostHog, Axiom
- Other: Claude Code CLI, GitHub Actions

---

## API Contracts

### Authentication Contract

```
POST /api/v1/admin/auth/login
  Request:
    Content-Type: application/json
    { "email": "admin@readmigo.com", "password": "..." }
  
  Response (200 OK):
    {
      "accessToken": "eyJhbGc...",
      "user": {
        "id": "usr_123",
        "email": "admin@readmigo.com",
        "displayName": "Admin User",
        "roles": ["admin"]
      }
    }
  
  Error (401):
    { "message": "Invalid credentials" }
```

### CRUD Contract (Generic)

```
GET /api/v1/admin/{resource}
  Headers:
    Authorization: Bearer {accessToken}
    X-Admin-Mode: true
    X-Content-Filter: en|zh|all
  
  Query Parameters:
    page=1
    limit=10
    sortBy=id
    sortOrder=ASC|DESC
    [filter fields]: value
  
  Response (200 OK):
    {
      "items": [{ id, createdAt, updatedAt, ... }],
      "total": 42
    }

GET /api/v1/admin/{resource}/{id}
  Response (200 OK):
    { "id": "xyz", "createdAt": "2026-01-15T10:00:00Z", ... }
  
  Error (404):
    { "message": "Not found" }

POST /api/v1/admin/{resource}
  Request:
    { "title": "New Book", "author": "Author Name", ... }
  
  Response (201 Created):
    { "id": "bk_456", "createdAt": "2026-05-24T12:00:00Z", ... }

PATCH /api/v1/admin/{resource}/{id}
  Request:
    { "title": "Updated Title" }  // Partial update
  
  Response (200 OK):
    { "id": "xyz", "title": "Updated Title", "updatedAt": "...", ... }

DELETE /api/v1/admin/{resource}/{id}
  Response (204 No Content) or (200 OK) with deleted object
```

### PostHog Query Contract

```
POST /api/projects/312868/query/
  Headers:
    Authorization: Bearer {personalApiKey}
    Content-Type: application/json
  
  Request:
    {
      "query": {
        "kind": "HogQLQuery",
        "query": "SELECT event, count() as cnt FROM events WHERE timestamp >= now() - INTERVAL 7 DAY GROUP BY event ORDER BY cnt DESC LIMIT 10"
      }
    }
  
  Response (200 OK):
    {
      "results": [
        { "event": "reading_started", "cnt": 1234 },
        { "event": "user_signup", "cnt": 567 }
      ],
      "timings": {
        "query_time": 234,
        "total_time": 456
      }
    }
```

### Header Semantics

| Header | Values | Purpose | Example |
|--------|--------|---------|---------|
| `Authorization` | `Bearer {token}` | JWT authentication | `Bearer eyJ0eXAi...` |
| `X-Admin-Mode` | `'true'` | Enable admin operations | Dashboard always sends `true` |
| `X-Content-Filter` | `'en'`, `'zh'`, `'all'` | Filter content by language | Set by ContentLanguageContext |

---

## Error Codes & Handling

### HTTP Status Codes

| Code | Scenario | Response |
|------|----------|----------|
| `200` | Request successful | `{ data: {...} }` or `{ items: [...], total: N }` |
| `201` | Resource created | `{ id: "...", ... }` |
| `204` | Resource deleted | (no body) |
| `400` | Invalid request (validation) | `{ message: "Email required", field: "email" }` |
| `401` | Unauthorized (invalid/missing token) | `{ message: "Invalid credentials" }` |
| `403` | Forbidden (insufficient permissions) | `{ message: "Admin access required" }` |
| `404` | Resource not found | `{ message: "Resource not found", id: "..." }` |
| `500` | Server error | `{ message: "Internal Server Error" }` |

### Client Error Handling

Dashboard error handling patterns:

```typescript
// In components / pages
try {
  const data = await dataProvider.getList(...);
  setData(data);
} catch (error) {
  // error.status, error.body, error.message available
  if (error.status === 401) {
    // Auth failed: logout
  } else if (error.status === 500) {
    // Server error: show retry button + error alert
    showNotification('API error', { type: 'error' });
  }
}

// In dataProvider.ts
const debugLog = (message: string, data?: unknown) => {
  // Global debug log if available
  window.__DEBUG_LOG__?.('data', `[DataProvider] ${message}`, data);
};
```

### Error Logging

Dashboard logs errors to:
1. Browser console (development)
2. Global error log (`window.__DEBUG_LOG__`) if available
3. Sentry (if integrated in future; not currently)

---

## Naming Conventions

### File & Folder Structure

- Components: PascalCase (`CustomLayout.tsx`, `StatCard.tsx`)
- Hooks: camelCase prefixed with `use` (`useEnvironment`, `useTimezone`)
- Services: camelCase (`authProvider.ts`, `dataProvider.ts`)
- Utils: camelCase (`formatDate.ts`, `parseError.ts`)
- Configs: camelCase with suffix (`costConfig.ts`, `environments.ts`)
- Context: PascalCase + `Context` suffix (`EnvironmentContext.tsx`)

### Type & Interface Naming

- React components: `{Name}Props` for props interface
- Context value: `{Name}ContextType` for provider value shape
- Responses: `{Resource}{Operation}Response` (e.g., `BookListResponse`)
- API contracts: `{Resource}DTO` for data transfer objects
- Config objects: `{Feature}Config` (e.g., `CostConfig`)

### CSS & Theming

- Design tokens: No underscores; use camelCase (e.g., `primaryColor`, `shadowLg`)
- CSS classes: kebab-case if needed (rare in MUI projects) (e.g., `reading-stats-container`)
- sx prop keys: camelCase from MUI (e.g., `backgroundColor`, `borderRadius`)

