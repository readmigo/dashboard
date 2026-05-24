---
title: Postmortem Template
phase: deploy
status: active
owner: data-team
last_updated: 2026-05-24
---

# Postmortem Template

Standard format for incident postmortems. Fill out this template within 24 hours of any significant incident.

---

## Incident summary

**Status**: [Template / [Example](#example-postmortem)]

**Date/time**: YYYY-MM-DD HH:MM UTC (incident start)

**Duration**: X minutes

**Impact**: 
- Severity: [Critical / High / Medium / Low]
- Users affected: [All / X% / specific team]
- SLO violated: [Yes / No]
- Error budget consumed: X%

**Timeline**: [Detection time] → [Root cause identified] → [Fix deployed] → [Resolved]

---

## Timeline

Detailed timeline of events. Include both observed symptoms and actions taken.

| Time | Event | Owner |
|------|-------|-------|
| T+0 (HH:MM) | [Symptom detected: e.g., "Checkly alert: 503 on dashboard"] | [Who detected] |
| T+5 | [Investigation: e.g., "Identified failed CI build"] | [Who investigated] |
| T+10 | [Action: e.g., "Reverted commit abc1234"] | [Who fixed] |
| T+15 | [Verification: e.g., "Dashboard live again"] | [Who verified] |

**Example timeline**:

| Time | Event | Owner |
|---|---|---|
| 14:05 UTC | Checkly alert: dashboard.readmigo.com → 503 | Monitoring system |
| 14:07 | Jack reviewed GitHub Actions, found TypeScript error in commit abc1234 | Jack |
| 14:09 | Reverted commit via `git revert abc1234 && git push` | Jack |
| 14:12 | CI build passed (new commit def5678) | GitHub Actions |
| 14:14 | Verified dashboard loads, metrics display correctly | Jack |
| 14:15 | Posted all-clear to #data-team Slack | Jack |

---

## Root cause analysis

**Primary root cause**: [Single, specific cause of the incident]

**Chain of events**: How did the primary cause lead to the incident?

```
[Root cause] → [Failure mode 1] → [Failure mode 2] → [Symptom experienced by users]
```

**Example**:

```
TypeScript type error not caught during review
  ↓
Code merged to main despite linting issues
  ↓
CI build failed (tsc error)
  ↓
Deployment blocked, dashboard serving stale version
  ↓
Dashboard serves old code while users expect new version (minor UX regression)
```

### Contributing factors

List factors that made the incident worse or harder to detect:

- [ ] No automated type checking in CI pre-commit (linting skipped)
- [ ] Code review didn't catch missing type annotation
- [ ] Didn't test locally before pushing
- [ ] No test case for the changed function

### Why we didn't catch it earlier

Preventive measures that were absent:

- No `pnpm lint` in pre-commit hook
- No mandatory linting in code review
- No type-checking gate in CI (only in build, after merge)

---

## Impact

### User-facing impact

**Scope**: 
- [ ] All users
- [ ] X% of users
- [ ] Specific feature/page: ___________
- [ ] Specific geographic region: ___________

**What users experienced**:
- [ ] Feature unavailable
- [ ] Data not displaying
- [ ] Slow performance (>5s)
- [ ] Error messages
- [ ] Other: ___________

**Duration**: X minutes (from first symptom to resolution)

**Example impact**:

- **Scope**: All users accessing dashboard
- **Experience**: Page loaded but TypeScript error in console; charts not rendering
- **Duration**: 8 minutes
- **Users affected**: 2–3 ops team members

### Business impact

- **Operations blocked?** [Yes / No] — Could ops team make decisions during incident?
- **Revenue impacted?** [Yes / No] — Was this a revenue-facing system?
- **SLO violated?** [Yes / No] — Was uptime <99.9%?
- **Data loss?** [Yes / No] — Was any data corrupted or lost?

### Internal impact

- **Team workload**: Incident response took X hours (on-call + investigation + fix)
- **Confidence**: Did team confidence in system decrease?
- **Alerting**: Were alerts effective or did we miss signals?

---

## Fixes & improvements

### Immediate fix

**What was done to restore service**: [Short description]

**Who did it**: [Name]

**Time to fix**: X minutes (from detection to resolution)

**Example**:

- **Fix**: Reverted commit abc1234 via `git revert`
- **Who**: Jack
- **Time**: 7 minutes

### Preventive measures

**Changes to prevent this incident in the future**:

| Measure | Owner | Timeline | Priority |
|---------|-------|----------|----------|
| Add `pnpm lint` to pre-commit hook | Jack | Sprint 12 | High |
| Add TypeScript type-check gate in CI | Jack | Sprint 12 | High |
| Create code review checklist for TypeScript | Data team | Sprint 11 | Medium |
| Add unit test for affected function | Jack | Sprint 11 | Medium |

**Reasoning**: Each measure should address either the root cause or a contributing factor.

### Monitoring improvements

**Better detection next time**:

- [ ] Add Sentry alert on TypeScript errors (currently missing)
- [ ] Lower error rate threshold from 1% to 0.5%
- [ ] Add synthetic test that exercises TypeScript paths
- [ ] Increase Checkly frequency from 5 min to 1 min

---

## Action items

**Owners and deadlines for follow-up work**:

| Action | Owner | Due date | Status |
|--------|-------|----------|--------|
| Add pre-commit type check | Jack | 2026-05-31 | Open |
| Review code review process | Data team | 2026-05-28 | Open |
| Create linting checklist | Jack | 2026-05-28 | Open |
| Post-incident review meeting | Jack | 2026-05-25 | Open |

**Tracking**: Record these in your team's issue tracker (GitHub Issues, Jira, etc.) with the label `incident-followup`.

---

## Lessons learned

**What did we learn?**

- Incident response was [fast / slow] because [reason]
- Communication could be improved by [suggestion]
- We were surprised by [unexpected behavior]
- We should have [preventive action]

**Example**:

- Communication was fast — Slack alerts reached on-call within 1 min
- Could improve by creating public incident status page (ops team can see what's wrong)
- Surprised by how quickly root cause was identified (good code organization helped)
- Should have caught this in code review (missing type annotation was obvious in hindsight)

---

# Example Postmortem

*Use this as a reference for filling out your own postmortem.*

## Incident summary

**Date/time**: 2026-05-20 14:05 UTC

**Duration**: 8 minutes

**Impact**:
- Severity: High
- Users affected: Readmigo ops team (2–3 people actively using dashboard at time)
- SLO violated: Yes (availability dropped to 98.4%, target is 99.9%)
- Error budget consumed: ~2%

**Timeline**: [Detection 14:05] → [Root cause identified 14:10] → [Rollback deployed 14:12] → [Resolved 14:15]

---

## Timeline

| Time | Event | Owner |
|---|---|---|
| 14:05 | Checkly alert: dashboard returns 503 for 2+ minutes | Monitoring |
| 14:07 | Jack reviews GitHub Actions, finds TypeScript error in commit abc1234 | Jack |
| 14:09 | Revert commit via `git revert abc1234 && git push origin main` | Jack |
| 14:12 | CI build passes with new commit def5678 | GitHub Actions |
| 14:14 | Dashboard loads successfully, charts render, PostHog queries work | Jack |
| 14:15 | All-clear posted to #data-team Slack | Jack |

---

## Root cause analysis

**Primary root cause**: TypeScript type error not caught in code review

```
Developer committed code with missing type annotation
  ↓
Code review approved without catching type error
  ↓
PR merged to main branch
  ↓
CI build failed (tsc compilation error)
  ↓
Deployment blocked, dashboard serving stale code
  ↓
ops team sees minor UX regression (old version without new feature)
```

### Contributing factors

- [ ] **No pre-commit hook**: linting/type-checking only runs in CI, after merge
- [x] **Skipped code review**: Reviewer didn't catch missing type annotation
- [x] **No local testing**: Developer didn't test build locally before pushing
- [x] **Limited test coverage**: Unit test didn't catch the type error

### Why we didn't catch it earlier

- TypeScript is only run as part of `pnpm build`, which happens in CI (after merge)
- Code review focused on logic, not type safety
- No ESLint configuration enforcing strict type checks

---

## Impact

### User-facing impact

**Scope**: All users accessing dashboard

**What users experienced**: 
- Dashboard page returned 503 error
- Checkly synthetic monitor alerted
- Operations team couldn't access metrics

**Duration**: 8 minutes (14:05–14:15 UTC)

**Users affected**: 2 ops team members actively using dashboard

### Business impact

- **Operations blocked?** Yes — team couldn't check key metrics during decision-making
- **Revenue impacted?** No — internal tool
- **SLO violated?** Yes — 8 min downtime exceeds 4.3 min monthly budget
- **Data loss?** No — all data intact

### Internal impact

- **Team workload**: 15 minutes total (5 min investigation, 7 min rollback, 3 min verification)
- **Confidence**: Moderate — shows good detection, fast response, but highlights missing preventive measures
- **Alerting**: Effective — Checkly detected and alerted within 1–2 minutes

---

## Fixes & improvements

### Immediate fix

- **What**: Reverted commit abc1234 (removed bad code)
- **Who**: Jack
- **Time**: 7 minutes from detection to resolution

### Preventive measures

| Measure | Owner | Timeline | Priority |
|---------|-------|----------|----------|
| Add pre-commit TypeScript check hook | Jack | Sprint 12 (2026-05-31) | High |
| Add tsc gate in CI pipeline (before Vite build) | Jack | Sprint 12 (2026-05-31) | High |
| Create code review checklist for TypeScript | Data team | Sprint 11 (2026-05-24) | Medium |
| Add unit test for Chart component rendering | Jack | Sprint 11 (2026-05-24) | Medium |

---

## Action items

| Action | Owner | Due date | Status |
|--------|-------|----------|--------|
| Create GitHub issue: "Pre-commit type checking" | Jack | 2026-05-21 | Complete |
| Post-incident sync meeting | Data team | 2026-05-20 | Complete |
| Implement pre-commit hook (husky + lint-staged) | Jack | 2026-05-31 | Open |
| Document code review checklist | Jack | 2026-05-24 | Open |

**Tracking**: All recorded in GitHub Issues under label `incident-postmortem-2026-05-20`.

---

## Lessons learned

- **Detection was effective**: Checkly alert caught the issue within 1–2 min, much faster than ops team noticing
- **Response was swift**: Once alerted, root cause identified and fixed within 10 minutes
- **Preventive measures are key**: We can't rely on code review to catch type errors; need automated checks
- **Communication worked**: Clear Slack updates kept team informed, no confusion or duplicate effort
- **Surprising**: How quickly TypeScript errors can slip into production without pre-commit checks

**For next incident**:
- Will have pre-commit type checking enabled
- Will include tsc step in CI before Vite bundling
- Will have a shorter detection time with lower error rate threshold

---

**Related**: [Monitoring & Alerting](monitoring.md) | [Runbooks](runbooks.md) | [SLI / SLO](sli-slo.md)
