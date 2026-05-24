---
title: CD Flow
phase: pipeline
status: active
owner: data-team
last_updated: 2026-05-24
---

# CD Flow

Continuous Deployment (CD) workflow for Readmigo Dashboard. Automatically deploys successful builds from `main` to production.

## Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| **Push to main** | After CI passes | Auto-deploy to production |
| **Manual redeploy** | Via GitHub Actions UI (if needed) | Trigger deployment for existing build |

**Workflow files**:
- Primary CI/CD: `.github/workflows/ci.yml` (runs on push to `main`)
- Docs check: `.github/workflows/docs-check.yml` (validates documentation)

**Deployment begins**: ~1–2 minutes after commit passes CI.

## Environment matrix

| Environment | URL | Status | Deployment Target |
|-------------|-----|--------|-------------------|
| **Production** | `https://dashboard.readmigo.com` | Active | GitHub Pages / Vercel |
| **Development** | `http://localhost:3001` | Local only | Not auto-deployed |
| **Staging** | N/A | Not available | Use production only |

### Production environment

**URL**: `https://dashboard.readmigo.com`

**Hosting**: 
- Primary: GitHub Pages (gh-pages branch)
- Secondary: Vercel (optional, for faster edge delivery)

**DNS**: CNAME record points `dashboard.readmigo.com` to GitHub Pages or Vercel CDN.

**Configuration**: Environment variables injected at build time:

| Variable | Default | Override |
|----------|---------|----------|
| `VITE_API_URL` | `https://readmigo-api.fly.dev` | Via GitHub repository secrets |
| `VITE_POSTHOG_HOST` | `https://us.posthog.com` | Via GitHub repository secrets |
| `VITE_POSTHOG_PROJECT_ID` | `312868` | Via GitHub repository secrets |
| `VITE_POSTHOG_PERSONAL_API_KEY` | Required | Via GitHub repository secrets |
| `VITE_AUTH_DISABLED` | `false` | Via GitHub repository secrets (dev only) |

## Release steps

### Automated workflow

```
Developer push to main
  ↓
GitHub Actions: Checkout code
  ↓
Run CI pipeline (tsc + vite build)
  ↓
CI passes? → Build artefacts in dist/
  ↓
Deploy dist/ to GitHub Pages (gh-pages branch)
  ↓
CDN refresh (automatic, ~1–2 min)
  ↓
https://dashboard.readmigo.com live
```

### Manual workflow (rare)

If automated deployment fails or needs urgent rollback:

```bash
# Build locally
pnpm install
pnpm build

# Manually push dist/ to GitHub Pages
# (requires gh CLI or Git push permissions)
```

### Deployment checklist

Before releasing to production:

- [ ] CI passes on `main` branch
- [ ] Type check succeeds (`tsc`)
- [ ] Build succeeds (`vite build`)
- [ ] No unresolved merge conflicts
- [ ] Environment secrets are up-to-date
- [ ] PostHog API key has correct permissions (Dashboard:Write, Insight:Read)

## Rollback coupling

### Commit revert triggers redeploy

If a commit breaks production:

1. **Identify bad commit**: `git log --oneline origin/main` (check GitHub Actions logs)
2. **Revert locally**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. **CD redeploys automatically**: New commit triggers CI/CD, deploys revert to production
4. **Timeline**: ~2–3 minutes from push to live

### Example: CSS regression breaks layout

**Scenario**: Commit 1a2b3c changes a theme color, breaks dashboard layout.

```
12:00 → Push 1a2b3c to main
12:02 → CI passes, deployed live (ops team notices broken layout)
12:05 → Identify root cause: brandTokens.ts color change
12:07 → git revert 1a2b3c && git push
12:10 → CI re-runs, passes
12:12 → Revert deployed live, layout fixed
```

### Atomic commits

Deployments are tied to **individual commits**, not pull requests. Each commit to `main` is independently deployable:

- **No batch releases**: Commits are deployed individually
- **Automatic sequencing**: Rollback via `git revert`, not manual selection
- **Risk**: Single bad commit affects production; mitigate via code review in PRs

### Zero-downtime deployment

Static files are served from a CDN:

- `dist/index.html` → no cache header (always fresh)
- `dist/assets/*.js`, `dist/assets/*.css` → long cache (immutable hash-based names)

**Result**: Users see new version within 1–2 seconds of deploy (no browser cache busting needed).

---

**Related**: [CI Flow](ci.md) | [Rollback Runbook](../08-deploy/rollback.md) | [Secrets Management](secrets.md)
