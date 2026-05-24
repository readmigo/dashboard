---
title: arc42 §6 — Runtime View
phase: ssad
status: active
owner: data-team
last_updated: 2026-05-24
---

# arc42 §6 — Runtime View

## Key scenarios

### 1. Page load and authentication

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as App Root
    participant AP as AuthProvider
    participant API as Readmigo API
    B->>A: Load SPA
    A->>AP: checkAuth()
    alt JWT in sessionStorage
        AP-->>A: Authenticated
    else No token
        A->>B: Redirect to login
        B->>AP: login(credentials)
        AP->>API: POST /auth/login
        API-->>AP: JWT token
        AP->>AP: Store in sessionStorage
        AP-->>A: Authenticated
    end
    A->>B: Render Dashboard
```

### 2. Analytics query via PostHog

```mermaid
sequenceDiagram
    participant P as Analytics Page
    participant PH as PostHog API
    P->>PH: POST /query/
    Note right of P: HogQL from posthog-queries.ts
    PH-->>P: Query results (JSON)
    P->>P: Filter internal users
    P->>P: Render Recharts chart
```

### 3. CRUD operation

```mermaid
sequenceDiagram
    participant U as User
    participant RA as react-admin
    participant DP as DataProvider
    participant API as Readmigo API
    U->>RA: Edit book form
    RA->>DP: update('books', {id, data})
    DP->>DP: Read environment
    DP->>API: PUT /books/{id}
    Note right of DP: Bearer JWT + headers
    API-->>DP: Updated book JSON
    DP-->>RA: Parsed response
    RA->>U: Success notification
```

### 4. Environment switching

```mermaid
sequenceDiagram
    participant U as User
    participant ES as Selector
    participant CTX as EnvironmentContext
    participant LS as localStorage
    U->>ES: Select "Production"
    ES->>CTX: setEnvironment('production')
    CTX->>LS: Store preference
    CTX->>CTX: Dispatch change event
    Note right of CTX: Subsequent API calls use api.readmigo.app
```

## Error recovery paths

| Failure | Detection | Recovery |
|---|---|---|
| React component crash | GlobalErrorBoundary | Renders fallback UI with error details; logs to debug buffer |
| API request failure | DataProvider catch | Logs to `window.__DEBUG_LOG__`, shows react-admin error notification |
| PostHog query timeout | Fetch timeout | Page shows loading state; user can retry manually |
| Auth token expired | 401 response | AuthProvider redirects to login page, clears sessionStorage |
| Unhandled rejection | `onunhandledrejection` | Captured in debug ring buffer (200 entries max) |

Related: [05-building-blocks.md](./05-building-blocks.md), [07-cross-cutting.md](./07-cross-cutting.md)
