---
title: Twelve-Factor App Self-audit
phase: pipeline
status: active
owner: data-team
last_updated: 2026-05-24
---

# Twelve-Factor App Self-audit

Readmigo Dashboard evaluation against the Twelve-Factor App methodology for building modern SaaS applications.

## I. Codebase

**Principle**: Single codebase tracked in version control, multiple deployable instances.

**Status**: ✅ **COMPLIANT**

- **Repository**: Single GitHub repo (`github.com/readmigo/dashboard`)
- **Tracking**: Entire codebase in Git with full history
- **Branches**: `main` for production, feature branches for development
- **Deployment**: Every commit to `main` triggers automated deploy

**Implementation**:
```
main branch → GitHub Actions CI/CD → dist/ → dashboard.readmigo.com
```

**Notes**:
- No separate staging codebase; same code deployed everywhere
- Environment differences managed via Twelve-Factor III (config), not separate codebases

---

## II. Dependencies

**Principle**: Explicitly declare all dependencies; never rely on system-wide packages.

**Status**: ✅ **COMPLIANT**

- **Declaration**: `package.json` lists all dependencies and versions
- **Lock file**: `pnpm-lock.yaml` locks transitive dependencies
- **Installation**: `pnpm install --frozen-lockfile` ensures identical installs
- **No system packages**: No reliance on OS-level libraries (e.g., no apt/brew dependencies)
- **Build tool**: Node.js 20 and pnpm 9 are CI-provided, not system-dependent

**Dependency categories**:

| Type | File | Manager | Lock |
|------|------|---------|------|
| Production | `package.json` | pnpm | `pnpm-lock.yaml` |
| Development | `package.json` | pnpm | `pnpm-lock.yaml` |
| Runtime | Node.js 20 | CI environment | GitHub Actions |

**Test**: `pnpm install` works identically on any machine with Node 20 + pnpm 9.

---

## III. Config

**Principle**: Store configuration in environment variables, not in code.

**Status**: ✅ **MOSTLY COMPLIANT** (with caveats)

- **Env vars**: All `VITE_*` prefixed and injected at build time
- **No hardcoded secrets**: No API keys in source code
- **Vite substitution**: Build replaces `process.env.VITE_*` with actual values

**Configuration stored in environment**:

| Config | Env Var | Default | Required |
|--------|---------|---------|----------|
| PostHog API Key | `VITE_POSTHOG_PERSONAL_API_KEY` | None | Yes |
| API endpoint | `VITE_API_URL` | `https://readmigo-api.fly.dev` | No |
| PostHog host | `VITE_POSTHOG_HOST` | `https://us.posthog.com` | No |
| PostHog project | `VITE_POSTHOG_PROJECT_ID` | `312868` | No |
| Auth disabled | `VITE_AUTH_DISABLED` | `false` | No |

**Build-time substitution**:

Vite replaces `process.env.VITE_*` during bundling:

```typescript
// In source code
const apiUrl = process.env.VITE_API_URL || 'https://readmigo-api.fly.dev';

// After build (dist/)
const apiUrl = 'https://us.posthog.com' || 'https://readmigo-api.fly.dev';
```

**Caveat**: Values are baked into `dist/` at build time, not read at runtime.

- **Pro**: No runtime config changes without rebuild
- **Con**: Can't hotswap config without redeploy (acceptable for internal tool)

**Dev vs. Prod parity**: Controlled by `.env.local` (dev) vs. GitHub secrets (prod).

---

## IV. Backing services

**Principle**: Treat backing services as attached resources; swap implementations without code changes.

**Status**: ✅ **COMPLIANT**

**Backing services**:

| Service | Type | Config | Swappable |
|---------|------|--------|-----------|
| PostHog | Analytics API | `VITE_POSTHOG_*` | Yes (via env vars) |
| Readmigo API | REST backend | `VITE_API_URL` | Yes (via env vars) |
| GitHub Pages / Vercel | Hosting | CI/CD | Yes (change `.github/workflows/`) |
| PostgreSQL (via API) | Database | Handled by API | N/A (not direct) |

**Usage pattern**:

- PostHog queries via `src/services/posthog.ts` (HTTP client)
- API calls via `src/services/api.ts` (HTTP client)
- No tight coupling to specific provider

**Swap example**: Change PostHog instance to a self-hosted deployment:

```bash
# Old
VITE_POSTHOG_HOST=https://us.posthog.com

# New
VITE_POSTHOG_HOST=https://posthog.mycompany.com
```

No code changes needed.

---

## V. Build, release, run

**Principle**: Strictly separate build, release, and run stages.

**Status**: ✅ **COMPLIANT**

### Build stage

```bash
pnpm build  # tsc && vite build
```

- Compiles TypeScript
- Bundles dependencies
- Minifies assets
- Outputs immutable `dist/` with hash-based filenames
- **Artefact**: `dist/` directory (can be archived, version tagged)

### Release stage

```bash
GitHub Actions CI/CD
```

- Takes `dist/` artefact
- Combines with environment config (GitHub secrets)
- Tags with commit SHA
- Uploads to GitHub Pages / Vercel

### Run stage

```
https://dashboard.readmigo.com live
```

- Serves `dist/` static files
- No compilation or asset processing
- Environment baked in at release stage, not altered at runtime

**Flow**:

```
Source code (src/) → Build (dist/) → Release (push to gh-pages) → Run (serve)
```

**Separation**: Each stage is independently executable and reproducible.

---

## VI. Processes

**Principle**: Application is stateless; each process is disposable.

**Status**: ✅ **COMPLIANT**

- **Stateless**: Single-Page Application (SPA) in browser, no server process
- **Session data**: Stored in browser (localStorage, sessionStorage, memory)
- **No sticky sessions**: Each tab/window is independent
- **Statelessness**: Can close/reopen dashboard any time without losing ability to function
- **Horizontal scaling**: N/A (client-side SPA, infinite capacity per browser)

**State management**:

| State Type | Location | Scope | Lifetime |
|-----------|----------|-------|----------|
| UI state | Memory (React) | Single tab | Page lifetime |
| User session | localStorage | Single domain | Browser-persistent |
| Query results | Memory + cache | Single tab | Until page reload |

**Benefit**: Can deploy new version anytime without affecting active users (except page reload).

---

## VII. Port binding

**Principle**: Export HTTP service via port binding; no dependency on web server.

**Status**: ✅ **COMPLIANT**

### Development

```bash
pnpm dev
# Vite dev server on http://localhost:3001
```

- **Port**: 3001 (configurable in `vite.config.ts`)
- **Self-contained**: Vite bundles everything; no external web server
- **API proxy**: Configured within Vite (requests to `/api` proxied to `http://localhost:3000`)

**vite.config.ts**:
```typescript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### Production

```bash
pnpm build
# dist/ is a static SPA ready for any HTTP server
```

- **No process**: `dist/` is pure static files
- **Served by**: GitHub Pages (built-in web server) or Vercel (edge network)
- **Port**: 443 (HTTPS) via CDN, abstracted away

**Self-contained**: Dashboard doesn't depend on a particular web server (Apache, Nginx); it works on any static host.

---

## VIII. Concurrency

**Principle**: Scale horizontally via concurrency model (processes, threads, goroutines).

**Status**: N/A — **NOT APPLICABLE** (client-side SPA)

- **Scope**: Dashboard runs in user's browser (client), not on servers
- **Concurrency**: Browser handles multi-tab concurrency natively
- **Scaling**: "Horizontal scaling" is adding more users' browsers, automatic
- **No server pool**: No load balancer or process manager needed

**Related**: CI/CD concurrency is managed in `.github/workflows/` with `cancel-in-progress: true` (prevents duplicate builds).

---

## IX. Disposability

**Principle**: Fast startup and graceful shutdown.

**Status**: ✅ **COMPLIANT**

### Fast startup

```bash
pnpm dev
# Vite dev server ready in ~2–5 seconds
```

- **Build cache**: Incremental bundling
- **Instant reload**: Hot Module Replacement (HMR) for code changes
- **No initialization**: No database migrations, server warmup, etc.

### Production startup

```bash
https://dashboard.readmigo.com
# Page loads in ~1–2 seconds (depends on network, browser cache)
```

- **Static files**: No server processing
- **CDN edge caching**: Assets served from global edge nodes

### Graceful shutdown

- **Browser tab close**: All resources freed automatically
- **No background tasks**: No cleanup needed
- **Immediate cessation**: No long-lived connections or pending requests

**Robustness**: Can start/stop dashboard anytime without data loss (state is in services, not dashboard process).

---

## X. Dev/prod parity

**Principle**: Keep development, staging, and production environments as similar as possible.

**Status**: ✅ **MOSTLY COMPLIANT**

### Environment parity

| Aspect | Dev | Prod | Parity |
|--------|-----|------|--------|
| Node.js version | 20 (local) | 20 (CI) | ✅ Yes |
| pnpm version | 9 (local) | 9 (CI) | ✅ Yes |
| Dependencies | `pnpm-lock.yaml` | `pnpm-lock.yaml` | ✅ Yes |
| Build process | `tsc && vite build` | `tsc && vite build` | ✅ Yes |
| Code | Same source | Same source | ✅ Yes |
| Config | `.env.local` | GitHub secrets | ✅ Equivalent |

### Minor differences

1. **API endpoint**: Dev points to `http://localhost:3000` (local backend); prod points to production API
2. **PostHog**: Dev can use test PostHog project; prod uses main project
3. **Auth**: Dev can disable auth (`VITE_AUTH_DISABLED=true`); prod requires GitHub login

**Mitigation**: Use production API and PostHog in dev as much as possible for accurate testing.

### Time parity

- Dev: Latest code from `main`
- Prod: Same code (deployed within 2–3 min of commit)
- **Lag**: <3 minutes (acceptable for internal tool)

### Tools parity

| Tool | Dev | Prod |
|------|-----|------|
| Build tool | Vite 5 | Vite 5 |
| Type checker | TypeScript 5.6 | TypeScript 5.6 |
| Linter | ESLint 8 | ESLint 8 (not in CI, only local) |
| Test runner | Playwright 1.58 | Playwright 1.58 (not in CI) |

**Gap**: Linting and testing not enforced in CI, reducing parity slightly.

---

## XI. Logs

**Principle**: Send logs to stdout/stderr; don't manage files. Execution environment handles aggregation.

**Status**: ✅ **COMPLIANT** (with extensions)

### Browser logs

Dashboard logs via browser console:

```typescript
console.log('Event X happened');
console.error('Error Y occurred');
```

**Captured by**: Browser DevTools, Sentry (error tracking), PostHog (event tracking).

### Global debug system

Custom in-memory ring buffer for runtime diagnostics:

```typescript
window.__DEBUG_LOG__  // 200-entry circular buffer
```

**Accessible**: Browser DevTools console:
```javascript
window.__DEBUG_LOG__()  // Print all debug entries
```

**Use case**: Diagnose issues without persisting logs to disk.

### Build logs

CI logs to stdout:

```
pnpm install --frozen-lockfile
pnpm build
```

**Captured by**: GitHub Actions logs (viewable in UI, exportable).

### Error tracking

Sentry integration captures runtime errors:

```typescript
import * as Sentry from '@sentry/react';
```

Errors sent to `https://sentry.io/organizations/readmigo/` for aggregation and alerting.

### PostHog events

Analytics events sent to PostHog API:

```typescript
posthog.capture('user_event', { property: 'value' })
```

### No file-based logs

- No logs written to disk (N/A for SPA)
- No log rotation needed
- No log archival process

**Principle compliance**: All logs flow to external systems (Sentry, PostHog, GitHub Actions), not local files.

---

## XII. Admin processes

**Principle**: One-off tasks (migrations, backups, imports) run as separate processes, not mixed with app.

**Status**: ⚠️ **PARTIAL COMPLIANCE**

### Data import / backups

**SE Content Import Pipeline**:

- **Process**: Separate batch job in the API service (not dashboard)
- **Trigger**: Manual via admin command or scheduled cron
- **Execution**: Runs independently from dashboard web service
- **Logging**: Logged to API service logs, separate from dashboard

**Outside dashboard scope**: Dashboard doesn't directly run imports; queries the API for status.

### Dashboard-specific admin tasks

| Task | Implementation | Separation |
|------|----------------|-----------|
| Clear browser cache | Manual (`localStorage.clear()`) | Ad-hoc, not automated |
| Reset PostHog queries | Manual via PostHog UI | Not dashboard responsibility |
| Update environment vars | Via GitHub secrets + redeploy | Separate CI/CD step |
| Database cleanup (if needed) | Handled by backend API | Not dashboard responsibility |

### Gaps

- No built-in admin panel for maintenance tasks
- No scheduled cleanup jobs within dashboard
- No data exports or imports (handled externally)

**Mitigation**: Separate admin scripts can be created in backend (`api` repo) if needed.

---

## Summary

| Factor | Status | Notes |
|--------|--------|-------|
| I. Codebase | ✅ | Single repo, tracked in Git |
| II. Dependencies | ✅ | Explicitly declared, locked |
| III. Config | ✅ | Env vars, build-time substitution |
| IV. Backing services | ✅ | Abstracted via HTTP, swappable |
| V. Build/release/run | ✅ | Clear separation of stages |
| VI. Processes | ✅ | Stateless SPA, disposable |
| VII. Port binding | ✅ | Self-contained HTTP service |
| VIII. Concurrency | N/A | Client-side SPA, automatic scaling |
| IX. Disposability | ✅ | Fast startup/shutdown |
| X. Dev/prod parity | ✅ | Same build, nearly identical environments |
| XI. Logs | ✅ | stdout/stderr, external aggregation |
| XII. Admin processes | ⚠️ | Some tasks handled externally |

**Overall**: **11/12 factors fully compliant**, 1 not applicable, 1 partial. Dashboard follows Twelve-Factor principles well, with minor gaps in admin task automation (acceptable for internal tool).

---

**Related**: [CI Flow](ci.md) | [CD Flow](cd.md) | [Secrets Management](secrets.md)
