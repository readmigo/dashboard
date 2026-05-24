---
title: Deployment Guide
phase: deploy
status: active
owner: data-team
last_updated: 2026-05-24
---

# Deployment Guide

Steps for deploying Readmigo Dashboard to production.

## Environment inventory

| Environment | URL | Purpose | Deployment method | Frequency |
|-------------|-----|---------|-------------------|-----------|
| **Production** | `https://dashboard.readmigo.com` | Live analytics dashboard for Readmigo ops team | Automated CI/CD from `main` | Continuous (on each commit) |
| **Development** | `http://localhost:3001` | Local development with hot reload | Manual (`pnpm dev`) | As-needed during development |
| **Staging** | N/A | No separate staging environment | N/A | N/A |

### Production environment details

**Hosting**: GitHub Pages (primary) or Vercel (secondary)

**Domain**: `dashboard.readmigo.com` (CNAME points to GitHub Pages or Vercel)

**Build artefacts**: Static files in `dist/` directory

**Uptime requirement**: 99.9% (4.3 min downtime per month allowed)

**Access**: GitHub authentication required (employees only)

## Deployment steps

### Automated deployment (standard)

```
Developer commits to main branch
  ↓
Push to GitHub
  ↓
GitHub Actions: Trigger CI workflow (.github/workflows/ci.yml)
  ↓
Step 1: Checkout code
Step 2: Setup pnpm (v9)
Step 3: Setup Node.js (v20)
Step 4: Install dependencies (pnpm install --frozen-lockfile)
Step 5: Run build (pnpm build = tsc && vite build)
Step 6: Deploy dist/ to GitHub Pages
  ↓
Dashboard live at https://dashboard.readmigo.com
```

**Duration**: ~2–3 minutes from push to live

**Monitoring**: Check GitHub Actions tab for build status

### Manual deployment (rare)

If automated deployment fails, deploy manually:

```bash
# Build locally
pnpm install
pnpm build

# Verify build succeeded
ls -la dist/

# Option A: Push dist/ to GitHub Pages manually
git checkout gh-pages
git pull origin gh-pages
rm -rf *
cp -r dist/* .
git add .
git commit -m "Manual deploy: $(date)"
git push origin gh-pages

# Option B: Deploy to Vercel (if configured)
vercel deploy --prod
```

### Vercel deployment (if enabled)

If Vercel is configured as secondary deployment:

```bash
# Via Vercel CLI
vercel deploy --prod

# Via GitHub Integration (automatic with GitHub Actions)
# No manual steps needed — Vercel watches main branch
```

## Prerequisites

### Local development (before deploying)

- [ ] Node.js 20.x installed (`node --version`)
- [ ] pnpm 9.x installed (`pnpm --version`)
- [ ] Clone repository: `git clone github.com/readmigo/dashboard.git`
- [ ] Install deps: `pnpm install`
- [ ] Create `.env.local` with required variables (see Secrets Management)

### CI/CD environment (GitHub Actions)

- [ ] Repository secrets configured:
  - [ ] `VITE_POSTHOG_PERSONAL_API_KEY` — PostHog API key
  - [ ] Other optional secrets (API_URL, etc.)
- [ ] `.github/workflows/ci.yml` file present
- [ ] `main` branch protection rules (optional, recommended):
  - [ ] Require PR reviews before merge
  - [ ] Require CI to pass before merge
- [ ] GitHub Pages enabled (Settings → Pages → Source: Deploy from branch `gh-pages`)

### Network & DNS

- [ ] `dashboard.readmigo.com` DNS CNAME points to GitHub Pages or Vercel
- [ ] HTTPS certificate valid (auto-provisioned by GitHub Pages / Vercel)
- [ ] CDN / edge caching configured (optional, for faster delivery)

## Verification checklist

After deployment, verify these steps before considering deploy complete:

### Automated verification (CI/CD)

- [ ] GitHub Actions workflow completed successfully (green checkmark)
- [ ] No build errors in logs
- [ ] No type errors from TypeScript
- [ ] `dist/` directory generated with index.html, assets/, etc.

### Manual verification

1. **Access dashboard**:
   - Open `https://dashboard.readmigo.com` in browser
   - Should load within 3–5 seconds
   - No console errors (press F12 → Console tab)

2. **Verify functionality**:
   - [ ] Login screen appears (or dashboard if already authenticated)
   - [ ] Can authenticate with GitHub (if enabled)
   - [ ] Dashboard page loads and displays charts
   - [ ] PostHog queries execute (metrics update)
   - [ ] No missing images, fonts, or styling

3. **Check monitoring**:
   - [ ] Checkly synthetic monitor reports "up"
   - [ ] Sentry error rate normal (no spike in errors)
   - [ ] PostHog shows page views from dashboard.readmigo.com

4. **Validate config**:
   - [ ] API requests go to correct backend (check Network tab)
   - [ ] PostHog queries to correct project (check Network → XHR)
   - [ ] Authentication status correct (GitHub login or disabled)

### Performance check

- [ ] Page load time ≤3 seconds (p95)
- [ ] PostHog query response ≤2 seconds
- [ ] No 404 errors for assets (check Network tab)
- [ ] No console errors or warnings

### Rollback trigger

If any verification step fails:
1. Revert the commit: `git revert <commit-hash>`
2. Push to main: `git push origin main`
3. CI/CD automatically redeploys previous version
4. Verify rollback successful, then investigate root cause

---

**Related**: [CI Flow](../07-pipeline/ci.md) | [CD Flow](../07-pipeline/cd.md) | [Rollback Runbook](rollback.md) | [Monitoring & Alerting](monitoring.md)
