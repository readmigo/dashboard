---
title: CI Flow
phase: pipeline
status: active
owner: data-team
last_updated: 2026-05-24
---

# CI Flow

Continuous Integration (CI) workflow for Readmigo Dashboard. Runs on every pull request and push to `main`.

## Triggers

| Trigger | Branch | Event | Action |
|---------|--------|-------|--------|
| Pull Request | Any → `main` | `pull_request` | Run build, type check, lint |
| Push to main | `main` | `push` | Run build, deploy to production |

**Workflow file**: `.github/workflows/ci.yml`

**Concurrency control**: Cancel in-progress builds for the same branch (prevents resource waste).

```
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

## Steps

| Step | Command | Purpose | Time |
|------|---------|---------|------|
| **Checkout** | `actions/checkout@v4` | Clone repository code | ~5s |
| **Setup pnpm** | `pnpm/action-setup@v4` (v9) | Install package manager | ~3s |
| **Setup Node** | `actions/setup-node@v4` (v20) | Install Node.js runtime | ~5s |
| **Restore pnpm cache** | `cache: pnpm` | Skip reinstall if dependencies unchanged | ~2–10s |
| **Install dependencies** | `pnpm install --frozen-lockfile` | Fetch deps from pnpm-lock.yaml (no version changes) | ~15–30s |
| **Build & type-check** | `pnpm build` → `tsc && vite build` | Compile TypeScript, bundle with Vite | ~20–45s |

**Total time**: ~50–90 seconds (varies by cache hits).

### Build step details

```bash
pnpm build
```

Runs two sequential commands:

1. **TypeScript compiler** (`tsc`)
   - Checks all `.ts` and `.tsx` files for type errors
   - Generates `.d.ts` type definitions (if needed)
   - Does NOT emit JavaScript (Vite handles that)
   - **Fails CI if any type errors found**

2. **Vite bundler** (`vite build`)
   - Tree-shakes unused code
   - Minifies JavaScript and CSS
   - Generates sourcemaps
   - Outputs to `dist/` directory

**Success criteria**: Both commands exit with code 0.

## Gates

### Type safety

- **Tool**: TypeScript compiler (`tsc`)
- **Scope**: All source files (`src/**/*.ts`, `src/**/*.tsx`)
- **Fail condition**: Any type error (`error TS...`)
- **Example**:
  ```
  src/pages/Dashboard.tsx:45:10 - error TS2322: Type 'string | undefined' is not assignable to type 'string'
  ```

### Lockfile integrity

- **Tool**: `pnpm install --frozen-lockfile`
- **Scope**: `pnpm-lock.yaml` must match `package.json` versions
- **Fail condition**: Lockfile out of sync with package.json
- **Error message**:
  ```
  ERR_PNPM_FROZEN_LOCKFILE: Lock file is out of date
  ```

### Build success

- **Tool**: Vite
- **Scope**: Entire codebase must bundle without errors
- **Fail condition**: Unresolvable imports, syntax errors, missing dependencies
- **Example**:
  ```
  error when building entry module:
  Failed to resolve entry module (src/main.tsx)
  ```

### No explicit test gate

- **Note**: E2E tests (`pnpm test` via Playwright) are NOT run in CI
- **Reason**: Dashboard is internal tool; manual testing sufficient
- **Alternative**: Can add `pnpm test` step if more stringent QA required

## Acceleration (cache / matrix)

### pnpm cache

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: pnpm
```

**Effect**: Reuses `node_modules/` if `pnpm-lock.yaml` unchanged.

**Benefit**: Saves ~15–30 seconds per build (no network fetches).

### Concurrency cancellation

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

**Effect**: If 5 commits pushed in quick succession, only the latest build runs.

**Benefit**: Saves CI resources, faster feedback on latest commit.

### Single environment (no matrix)

Dashboard CI uses only **one build environment** (no matrix):

- `runs-on: ubuntu-latest`
- `node-version: 20`
- `pnpm-version: 9`

**Rationale**: Static SPA has no platform-specific build concerns (unlike mobile or server apps).

---

**Related**: [CD Flow](cd.md) | [Packaging & Build Artefacts](../06-app/packaging.md) | [Secrets Management](secrets.md)
