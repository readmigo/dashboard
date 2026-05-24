---
title: Rollback Runbook
phase: deploy
status: active
owner: data-team
last_updated: 2026-05-24
---

# Rollback Runbook

Procedures for rolling back broken deployments.

## Trigger conditions

Rollback is initiated when:

| Scenario | Severity | SLO impact | Action |
|----------|----------|-----------|--------|
| **Build fails (CI error)** | High | Yes | Revert commit, identify root cause |
| **Dashboard doesn't load (404/500)** | Critical | Yes | Immediate rollback |
| **Critical JavaScript error** | Critical | Yes | Immediate rollback |
| **PostHog queries not working** | High | Yes | Check API key, then rollback if config issue |
| **Styling broken (CSS regression)** | Medium | No | Rollback if broken user experience |
| **Chart displays incorrectly** | Medium | Partial | Rollback if rendering blocked |
| **Performance degradation** (>5s load) | Medium | Partial | Investigate, rollback if root cause unclear |
| **Data not displaying** (blank dashboard) | Critical | Yes | Immediate rollback |

**Who triggers**: Data team engineer, on-call engineer, or ops team member

**Timeline**: Decision within 5 minutes of detection; rollback live within 10 minutes

## Rollback steps

### Step 1: Confirm the problem

```bash
# Check GitHub Actions logs for latest build
# URL: https://github.com/readmigo/dashboard/actions

# Look for:
# - ✅ Build succeeded but deploy failed
# - ❌ Build failed
# - ⚠️ Deploy succeeded but production broken
```

### Step 2: Identify the bad commit

```bash
# Check recent commits
git log --oneline main -10

# Example output:
# abc1234 feat: add new metrics chart
# def5678 fix: PostHog API key validation
# ghi9012 chore: update dependencies
```

**Decision**: Which commit introduced the problem?

- If obvious (build failed): That's the bad commit
- If deployed but broken: Check deployment time vs. commit time to find culprit
- If unclear: Assume the most recent commit is problematic

### Step 3: Revert the commit

```bash
# Option A: Revert locally, then push
git revert <bad-commit-hash>
git push origin main

# Example:
git revert abc1234
git push origin main

# Option B: Use GitHub UI
# 1. Go to https://github.com/readmigo/dashboard/commits/main
# 2. Click on the bad commit
# 3. Click "Revert" button
# 4. Create pull request
# 5. Merge immediately

# Option C: Force revert via command line (use with caution)
git reset --hard <good-commit-hash>
git push --force origin main
# ⚠️ Only use if revert commit is unsafe
```

**Recommendation**: Use Option A (revert commit) — safest and creates audit trail.

### Step 4: Verify rollback commit

```bash
# Verify revert commit exists
git log --oneline main -5

# Should show:
# xyz7890 Revert "feat: add new metrics chart"
# abc1234 feat: add new metrics chart
# ...
```

### Step 5: CI/CD re-runs automatically

GitHub Actions will:

1. Detect push to `main`
2. Checkout revert commit
3. Run CI pipeline
4. Build succeeds (uses previous stable code)
5. Deploy `dist/` to GitHub Pages / Vercel

**Monitor**: https://github.com/readmigo/dashboard/actions

**Expected duration**: 2–3 minutes

## Verification steps

After rollback, verify these before declaring "rollback complete":

### Immediate checks (1 minute)

```bash
# Check GitHub Actions status
# Should show: ✅ Latest build succeeded

# Check dashboard loads
curl -I https://dashboard.readmigo.com
# Should return: 200 OK, Content-Type: text/html
```

### Functional verification (3 minutes)

1. **Open dashboard in browser**:
   - URL: `https://dashboard.readmigo.com`
   - Should load without 404 or 500 errors

2. **Verify core functionality**:
   - [ ] Login screen loads
   - [ ] Dashboard page accessible (with auth)
   - [ ] Charts render without JavaScript errors
   - [ ] PostHog metrics load (check Network tab)

3. **Check monitoring**:
   - [ ] Sentry error rate drops back to normal
   - [ ] Checkly synthetic monitor reports "up"
   - [ ] PostHog event capture resuming normally

### Confirm fix

```bash
# Verify commit before bad commit is now live
git log --oneline main -3

# Should show latest deployed code is the good commit
```

### Timeline tracking

| Time | Action | Status |
|------|--------|--------|
| T+0 | Problem detected (e.g., 14:05) | Confirmed |
| T+5 | Bad commit identified (14:10) | abc1234 |
| T+7 | Revert commit pushed (14:12) | `git push origin main` |
| T+10 | CI/CD completes (14:15) | ✅ Build passed |
| T+12 | Dashboard live and verified (14:17) | ✅ Rollback complete |

## Post-rollback communication

### Alert channels

Notify these channels immediately:

1. **Slack #data-team**:
   ```
   ⚠️ [ROLLBACK] Dashboard rollback completed at 14:17 UTC
   Bad commit: abc1234 (feat: add new metrics chart)
   Root cause: [TBD after RCA]
   Status: ✅ Dashboard live and stable
   ```

2. **GitHub issue** (optional, for tracking):
   ```
   Title: [Rollback] Dashboard - <brief description>
   Labels: incident, rollback
   ```

### RCA (Root Cause Analysis)

After rollback stabilizes (within 30 minutes):

1. **Investigate**: What went wrong in the bad commit?
   - Code review the changes
   - Check CI logs for warnings
   - Test locally with same config

2. **Document**: Update issue/Slack with findings:
   ```
   Root cause: TypeScript type error not caught in build
   - src/components/Chart.tsx:45 used undefined prop
   - Missing type annotation on interface
   
   Prevention: Add tsc to CI pre-build lint step
   ```

3. **Create PR**: Fix the issue, test locally, push to new branch
   ```
   git checkout -b fix/metrics-chart-type-error
   # Fix the issue
   git push origin fix/metrics-chart-type-error
   # Create PR, request review
   ```

## Rollback caveats

### Data loss considerations

Dashboard is a **read-only analytics SPA** — no data is created/modified:

- ✅ Safe to rollback: No data loss
- ✅ Safe to rollback multiple times: Idempotent
- ✅ Safe to rollback immediately: No cleanup needed

### Session interruption

Users actively viewing dashboard will see:

- Page reload (automatic, transparent)
- Session maintained (GitHub auth persists)
- Queries re-executed (may take 1–2 seconds)

### CDN / edge cache

If rollback doesn't reflect immediately:

```bash
# GitHub Pages CDN clears automatically (~1 min)
# Vercel CDN clears automatically (~1 min)

# Force local browser cache clear (user-side)
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Reverting a revert

If rollback itself has issues:

```bash
# Revert the revert (go back to original bad commit)
git revert <revert-commit-hash>
git push origin main

# CI/CD re-deploys original commit
# Usually only if revert had unintended consequences
```

---

**Related**: [Deployment Guide](deployment-guide.md) | [CD Flow](../07-pipeline/cd.md) | [Monitoring & Alerting](monitoring.md)
