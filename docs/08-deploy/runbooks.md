---
title: On-call Runbooks
phase: deploy
status: active
owner: data-team
last_updated: 2026-05-24
---

# On-call Runbooks

Quick reference for responding to common production alerts and incidents.

## Runbook index

| Alert | Severity | Response time | Runbook |
|-------|----------|----------------|---------|
| **Dashboard not loading (503)** | Critical | <10 min | [#1](#1-dashboard-not-loading) |
| **Build failed in CI** | High | <15 min | [#2](#2-build-failed) |
| **PostHog API down or timing out** | High | <30 min | [#3](#3-posthog-api-issues) |
| **High error rate (>1% JavaScript errors)** | High | <30 min | [#4](#4-high-error-rate) |
| **GitHub authentication broken** | High | <30 min | [#5](#5-auth-failure) |
| **Blank dashboard (no data displayed)** | High | <15 min | [#6](#6-blank-dashboard) |
| **Page load slow (>5 seconds p95)** | Medium | <1 hour | [#7](#7-performance-degradation) |
| **Intermittent 404 on assets** | Medium | <1 hour | [#8](#8-cdn-cache-issue) |

---

## 1. Dashboard not loading (503)

**Alert**: Checkly synthetic monitor reports 503 or timeout

**Severity**: Critical | **SLO impact**: Yes

### Diagnosis (2 min)

```bash
# Check GitHub Actions latest build
open https://github.com/readmigo/dashboard/actions

# Check deployment status
open https://github.com/readmigo/dashboard/deployments

# Manual test
curl -I https://dashboard.readmigo.com
# Should return: 200 OK, not 503

# Check DNS
nslookup dashboard.readmigo.com
# Should resolve to GitHub Pages IP or Vercel IP
```

### Root causes and fixes

| Cause | Check | Fix |
|-------|-------|-----|
| **CI build failed** | Actions log has red X | Revert bad commit, see [Rollback Runbook](rollback.md) |
| **GitHub Pages down** | `status.github.com` shows outage | Wait for GitHub to recover, or deploy to Vercel |
| **DNS/CDN issue** | `nslookup` fails or wrong IP | Check GitHub/Vercel DNS configuration |
| **dist/ is empty** | `git ls-tree gh-pages` shows empty | Re-run CI or manual deploy |

### Response

1. **Identify cause** (1 min) — Check CI logs and DNS
2. **Take action** (3–5 min) — Either:
   - Wait for GitHub to recover (if GitHub down)
   - Revert bad commit (if CI failed)
   - Redeploy manually (if dist is stale)
3. **Verify** (2 min) — Test `https://dashboard.readmigo.com`
4. **Notify** (#data-team) — "Dashboard restored, root cause: [X]"

---

## 2. Build failed

**Alert**: GitHub Actions reports build failure (red X in Actions tab)

**Severity**: High | **SLO impact**: Partial (affects new deploys, not current production)

### Diagnosis (2 min)

```bash
# Check the failed job log
open https://github.com/readmigo/dashboard/actions

# Look for error message, typically:
# - "error TS..." (TypeScript compilation)
# - "error [...]" (Vite build)
# - "error: PNPM" (dependency issue)
```

### Root causes and fixes

| Cause | Error message | Fix |
|-------|---------------|-----|
| **Type error** | `error TS2322: Type 'X' is not assignable` | Review the changed file, fix type annotation |
| **Missing import** | `Cannot find name 'X'` | Add missing import statement |
| **Dependency mismatch** | `ERR_PNPM_FROZEN_LOCKFILE` | Run `pnpm install` locally, commit updated lock file |
| **Syntax error** | `SyntaxError: Unexpected token` | Check for trailing commas, missing brackets |

### Response

1. **Identify error** (1 min) — Read error message in Actions log
2. **Locate file** (1 min) — Error message shows file and line number
3. **Fix locally** (5–10 min):
   ```bash
   git checkout main
   git pull origin main
   # Open the file mentioned in error
   # Fix the error (type annotation, import, syntax, etc.)
   git add .
   git commit -m "fix: [error name]"
   git push origin main
   ```
4. **Verify** (2 min) — Check Actions tab for green checkmark

---

## 3. PostHog API issues

**Alert**: PostHog queries timing out or returning errors

**Severity**: High | **SLO impact**: Yes (no analytics data)

### Diagnosis (2 min)

```bash
# Check PostHog status
open https://status.posthog.com

# Check dashboard logs for API errors
open https://dashboard.readmigo.com
# Press F12 → Network tab → XHR
# Look for failed requests to posthog.com

# Manual API test
curl -X GET \
  "https://us.posthog.com/api/insights/" \
  -H "Authorization: Bearer <API_KEY>" \
  -w "\nStatus: %{http_code}\n"
```

### Root causes and fixes

| Cause | Fix | Timeline |
|-------|-----|----------|
| **PostHog infrastructure down** | Wait for PostHog to recover | Check `status.posthog.com` |
| **Rate limit (429)** | Contact PostHog support to increase quota | <1 hour |
| **Invalid API key** | Check `VITE_POSTHOG_PERSONAL_API_KEY` secret | <5 min to fix |
| **Wrong Project ID** | Verify `VITE_POSTHOG_PROJECT_ID` matches PostHog account | <5 min to fix |
| **Network timeout** | Check local network, restart browser | <2 min |

### Response

1. **Check PostHog status** (1 min)
   - Go to `https://status.posthog.com`
   - If red: wait for them to recover, notify #data-team
   
2. **Verify credentials** (2 min)
   - Go to GitHub → Settings → Secrets
   - Check `VITE_POSTHOG_PERSONAL_API_KEY` is not expired
   - Go to PostHog account → Personal API Keys
   - Verify key has scopes: `Dashboard:Write`, `Insight:Read`

3. **If expired**: Rotate key (see [Secrets Management](../07-pipeline/secrets.md))

4. **Contact PostHog support** (if rate limited)
   - Email: support@posthog.com
   - Include: dashboard URL, error message, usage stats

---

## 4. High error rate

**Alert**: Sentry reports >1% error rate for 5+ minutes

**Severity**: High | **SLO impact**: Yes

### Diagnosis (2 min)

```bash
# Check Sentry
open https://sentry.io/organizations/readmigo/

# Look for:
# - New error type (red badge)
# - Error spike (chart jumps)
# - Error message and stack trace
```

### Root causes and fixes

| Error type | Cause | Fix |
|------------|-------|-----|
| **ReferenceError: X is not defined** | Variable out of scope | Check component logic, add null checks |
| **TypeError: Cannot read properties** | Null/undefined value | Check data fetching, add defensive code |
| **Network error** | Backend/PostHog down | Check API status |
| **Syntax error** | Bad code in production | Rollback, see [Rollback Runbook](rollback.md) |

### Response

1. **Check latest deployment** (1 min)
   - Go to Actions → latest build
   - Did something just deploy? If yes, suspect that commit

2. **Decide: Fix or Rollback?**
   - If errors are minor (UX/UI): investigate and fix in new commit
   - If errors are critical (blank dashboard, no data): rollback immediately

3. **If rollback needed**:
   ```bash
   # See [Rollback Runbook](rollback.md)
   git revert <bad-commit>
   git push origin main
   ```

4. **If fix needed**:
   - Identify the issue (stack trace in Sentry)
   - Create fix locally
   - Test locally
   - Push to main, let CI/CD re-deploy

---

## 5. Auth failure

**Alert**: Users cannot login to dashboard

**Severity**: High | **SLO impact**: Yes (dashboard inaccessible)

### Diagnosis (2 min)

```bash
# Test login flow manually
open https://dashboard.readmigo.com
# Try to login with GitHub

# Check OAuth app settings
open https://github.com/settings/developers/oauth-apps
# Look for Readmigo Dashboard OAuth app
```

### Root causes and fixes

| Cause | Fix |
|-------|-----|
| **GitHub OAuth app misconfigured** | Check redirect URI matches `https://dashboard.readmigo.com` |
| **OAuth secret rotated** | Regenerate secret in GitHub, update in app |
| **Auth middleware down** | Check if react-admin auth provider is broken |
| **VITE_AUTH_DISABLED not set correctly** | Verify auth flag in GitHub secrets |

### Response

1. **Check GitHub OAuth settings**:
   - Go to `https://github.com/settings/developers/oauth-apps`
   - Click Readmigo Dashboard app
   - Verify "Authorization callback URL" = `https://dashboard.readmigo.com/callback` (or actual redirect)

2. **If wrong**: Update callback URL, redeploy

3. **If secrets changed**: Regenerate and update GitHub secrets

4. **As workaround**: Disable auth temporarily
   ```bash
   # In GitHub secrets, set:
   VITE_AUTH_DISABLED=true
   
   # Push dummy commit to trigger redeploy
   git commit --allow-empty -m "chore: disable auth for troubleshooting"
   git push origin main
   ```

---

## 6. Blank dashboard

**Alert**: Dashboard loads but shows no data (blank charts, no metrics)

**Severity**: High | **SLO impact**: Yes

### Diagnosis (2 min)

```bash
# Open dashboard and check console
open https://dashboard.readmigo.com
press F12 → Console tab

# Look for JavaScript errors (red text)
# Look for network errors fetching PostHog/API
```

### Root causes and fixes

| Cause | Fix |
|-------|-----|
| **PostHog API not responding** | See [#3 PostHog API issues](#3-posthog-api-issues) |
| **Backend API down** | Check `VITE_API_URL` endpoint |
| **API key invalid** | Rotate PostHog API key |
| **Data not in PostHog yet** | Wait for events to ingest (usually <1 min) |
| **JS error preventing render** | Check console, rollback if recent deploy |

### Response

1. **Check Network tab** (F12 → Network):
   - Are PostHog API calls succeeding? (green 200)
   - Are backend API calls succeeding? (green 200)

2. **If API calls failing**:
   - Check PostHog status
   - Check API status
   - Check credentials

3. **If API calls succeeding but no data**:
   - Wait 1–2 minutes (data ingestion lag)
   - Check if events being sent from mobile apps
   - Check query filters (date range, user filters)

---

## 7. Performance degradation

**Alert**: Page load time >5 seconds (p95) for sustained period

**Severity**: Medium | **SLO impact**: Partial

### Diagnosis (5 min)

```bash
# Measure page load locally
open https://dashboard.readmigo.com
press F12 → Network tab
scroll to bottom → "Finish: X.XXs"

# Check network waterfall:
# - Large assets (JS/CSS >500KB)?
# - Slow API responses (>2s)?
# - Too many concurrent requests?

# Check browser memory usage
F12 → Memory tab → take snapshot
# Check if memory grows unbounded
```

### Root causes and fixes

| Cause | Fix | Impact |
|-------|-----|--------|
| **Large bundle size** | Tree-shake unused imports, enable gzip | Deploy new build |
| **Too many PostHog queries** | Paginate or cache queries | Code change |
| **CDN not caching** | Check cache headers on dist/ | Config change |
| **PostHog slow** | PostHog infra issue or rate limit | Contact PostHog |

### Response

1. **Measure baseline** (2 min) — Is it actually slow or a spike?
   ```
   Check PostHog real user metrics:
   - Last 1 hour: average page load
   - Last 24 hours: p95 page load
   ```

2. **Identify bottleneck** (2 min):
   - Is it on page load? (Network tab)
   - Is it after load? (Performance profiling)
   - Is it intermittent? (Recent deploy?)

3. **Fix strategy**:
   - **If recent deploy**: Rollback, see [Rollback Runbook](rollback.md)
   - **If bundle large**: Optimize imports and re-deploy
   - **If PostHog slow**: Contact support or reduce query frequency

---

## 8. CDN cache issue

**Alert**: Intermittent 404 on assets, stale CSS/JS

**Severity**: Medium | **SLO impact**: No (usually recovers in <1 min)

### Diagnosis (1 min)

```bash
# Hard refresh browser (skip cache)
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

# Check network response headers
F12 → Network → click on asset (e.g., main-abc123.js)
Look for: Cache-Control, ETag, Last-Modified
```

### Root causes and fixes

| Cause | Fix |
|-------|-----|
| **CDN cache stale** | Wait 1–2 min for cache refresh, or hard refresh locally |
| **dist/ file missing** | Redeploy from GitHub Actions |
| **Hash mismatch in HTML** | index.html points to old asset hash, rebuild |

### Response

1. **User-side fix**: Hard refresh (Cmd+Shift+R)

2. **Admin fix**: Manually purge CDN cache
   ```bash
   # GitHub Pages: auto-refreshes, just wait 1–2 min
   # Vercel: go to Vercel dashboard → Deployments → redeploy
   ```

---

## Escalation paths

### Data team escalation

**Primary**: Data team engineer (on-call)

**Secondary**: Data team manager

**Escalation criteria**: Incident unresolved after 30 minutes

### Backend team escalation

**When**: Backend API down or returning errors

**Contact**: Backend team engineer or Slack #backend

**Info to share**:
- Error message from API
- Timestamp of failure
- Whether this blocks Dashboard (yes)

### PostHog escalation

**When**: PostHog API down, rate limited, or data missing

**Contact**: support@posthog.com

**Info to share**:
- Project ID: 312868
- Error message
- Timestamp
- Estimated impact (analytics dashboard down)

---

## Contacts

### Internal team

| Role | Slack | Email | Timezone |
|------|-------|-------|----------|
| Data team lead | @jack | jack@readmigo.com | UTC+8 |
| Backend team lead | @backend-lead | backend@readmigo.com | UTC+8 |
| Engineering manager | @eng-manager | manager@readmigo.com | UTC+8 |

### External partners

| Provider | Support | Status |
|----------|---------|--------|
| **GitHub** | support@github.com | https://status.github.com |
| **PostHog** | support@posthog.com | https://status.posthog.com |
| **Vercel** | support@vercel.com | https://status.vercel.com |

---

**Related**: [Monitoring & Alerting](monitoring.md) | [Rollback Runbook](rollback.md) | [SLI / SLO](sli-slo.md)
