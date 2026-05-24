---
title: Monitoring & Alerting (Four Golden Signals)
phase: deploy
status: active
owner: data-team
last_updated: 2026-05-24
---

# Monitoring & Alerting (Four Golden Signals)

Production monitoring using the Four Golden Signals: Latency, Traffic, Errors, Saturation.

## Latency

**Definition**: How fast is the dashboard responding to user requests?

### Measurements

| Metric | Tool | SLO | Alert threshold |
|--------|------|-----|-----------------|
| **Page load time (p95)** | Browser RUM / PostHog analytics | ≤3 seconds | >5 seconds for 10 min |
| **PostHog query response** | PostHog API logs | ≤2 seconds | >5 seconds for 10 min |
| **First Contentful Paint (FCP)** | Browser RUM | ≤1.5 seconds | >2.5 seconds |
| **Time to Interactive (TTI)** | Browser RUM | ≤2.5 seconds | >4 seconds |

### Monitoring sources

1. **Browser Real User Monitoring** (via PostHog SDK):
   - Tracks actual user page load times
   - Sends timing metrics to PostHog
   - Viewable in PostHog dashboard

2. **PostHog query logs**:
   - API response time for HogQL queries
   - Shows in PostHog API logs or custom dashboard

3. **Network waterfall** (manual testing):
   - Open DevTools → Network tab
   - Check resource load times
   - Identify slow asset (JS, CSS, fonts)

### Latency troubleshooting

| Symptom | Likely cause | Investigation |
|---------|--------------|-----------------|
| Page load >5s | Large bundle size | Check `dist/` file sizes; enable gzip compression |
| PostHog queries slow | API rate limit or high load | Check PostHog usage dashboard |
| TTI slow | Heavy JavaScript | Profile with Chrome DevTools Performance tab |
| Intermittent slowness | Network/CDN issues | Check CDN status, run synthetic test |

---

## Traffic

**Definition**: How many users are accessing the dashboard?

### Measurements

| Metric | Tool | Typical | Alert |
|--------|------|---------|-------|
| **Page views** | PostHog event tracking | 100–500/day | >2x normal is unusual |
| **Unique users** | PostHog event tracking | 5–20/day | >2x normal is unusual |
| **API requests** | PostHog API metrics | 1000+/day | Rate limit reached? |
| **Error rate** | Sentry + PostHog | <0.5% | >1% for 5 min |

### Monitoring sources

1. **PostHog dashboard page views event**:
   - Tracks `dashboard_viewed` events
   - Queryable via HogQL: `SELECT count() FROM events WHERE event = 'dashboard_viewed'`
   - Visible in PostHog "Events" dashboard

2. **Vercel / GitHub Pages analytics** (if available):
   - Overall traffic counts
   - Geographic distribution
   - Device types

3. **CloudFlare analytics** (if CloudFlare proxy enabled):
   - Request counts
   - Cache hit rate
   - DDoS detection

### Traffic patterns

**Normal**: 5–20 unique users/day, 100–500 page views/day

**Spike indicators**:
- Scheduled incident review meeting → 2–3x traffic
- New feature launch → 1.5x traffic
- External issue → Sudden traffic drop (users can't access)

---

## Errors

**Definition**: How many things are breaking?

### Measurements

| Metric | Tool | SLO | Alert |
|--------|------|-----|-------|
| **JavaScript errors** | Sentry | <0.5% of requests | >1% for 5 min |
| **Unhandled exceptions** | Sentry | 0 | Any new error: alert |
| **API errors (4xx/5xx)** | Sentry / Network logs | <0.5% | >1% for 5 min |
| **PostHog API failures** | PostHog logs | 0 | Any failure: alert |

### Monitoring sources

1. **Sentry error tracking**:
   - URL: `https://sentry.io/organizations/readmigo/`
   - Captures all JavaScript errors + exceptions
   - Real-time alerting on new error types
   - Grouped by error message, stack trace

2. **PostHog custom events**:
   - Event: `dashboard_error` (if implemented)
   - Captures application-level errors
   - Filtered by error type, severity

3. **Browser console** (manual inspection):
   - F12 → Console tab
   - Red error messages
   - Warning traces

4. **GitHub Actions logs** (build-time errors):
   - Check for TypeScript compilation errors
   - Build failures stop deployment

### Error types and responses

| Error | Cause | Severity | Response |
|-------|-------|----------|----------|
| **TypeError: Cannot read property 'x'** | Null/undefined reference | High | Immediate investigation |
| **SyntaxError in bundled code** | Build issue | Critical | Rollback |
| **PostHog API 401/403** | Invalid API key | Critical | Check secrets, rotate if needed |
| **PostHog API 429** | Rate limit | Medium | Wait 1 hour or request higher limit |
| **Network error fetching /api/...** | Backend down | Critical | Check API service status |
| **CORS error** | API not allowing requests | High | Check backend CORS headers |

### Common errors and fixes

```
Error: Failed to load PostHog
→ Check VITE_POSTHOG_PERSONAL_API_KEY in secrets
→ Verify PostHog project ID matches

Error: Cannot read property 'addEventListener'
→ DOM not loaded yet; check script tag position
→ Use DOMContentLoaded event wrapper

Error: 404 on /api/users
→ Backend service down or API_URL misconfigured
→ Check VITE_API_URL environment variable
```

---

## Saturation

**Definition**: How full is the system?

### Measurements

| Metric | Typical | Saturation (>80%) | Critical |
|--------|---------|-------------------|----------|
| **Browser memory** | 50–100 MB | 200+ MB | >300 MB (browser crash) |
| **Network bandwidth** | <1 Mbps | >5 Mbps | >10 Mbps (CDN throttle) |
| **PostHog API quota** | <50% used | 80% used | 100% used (rate limited) |
| **GitHub Actions minutes** | <100/month | 400+ /month | >1000/month (paused) |

### Monitoring sources

1. **Browser DevTools Memory**:
   - Open F12 → Memory tab
   - Take snapshot to see memory usage
   - Refresh page, compare memory growth

2. **PostHog usage dashboard**:
   - Organization Settings → Usage
   - Shows event quota consumed
   - Shows API call quota

3. **GitHub Actions usage**:
   - Settings → Billing & plans
   - Shows minutes used this month
   - Free tier: 2000 min/month

4. **Network waterfall** (DevTools):
   - Network tab → waterfall
   - Check for large file downloads
   - Monitor concurrent requests

### Saturation concerns (internal tool)

For an internal analytics SPA, saturation is low-risk:

- ✅ **Low traffic**: 5–20 users, can't saturate infrastructure
- ✅ **Small bundle**: ~50 KB gzip, minimal bandwidth
- ✅ **No persistent connections**: Each request independent
- ⚠️ **PostHog quota**: Only bottleneck (shared resource with other apps)

**No horizontal scaling needed** — all "scaling" happens on user's machine (browser).

---

## Alert routing

### Alert channels

| Alert | Severity | Channel | Escalation |
|-------|----------|---------|------------|
| **Build failed** | High | #data-team Slack | On-call if unresolved >1 hour |
| **Dashboard down (503)** | Critical | #data-team + page on-call | Immediate (SLO violation) |
| **High error rate (>1%)** | High | #data-team Slack | On-call if >5% |
| **PostHog API down** | Medium | #data-team Slack | Message PostHog support |
| **Performance degradation** | Medium | Daily report (passive) | Investigate next standup |
| **Security alert** (Sentry) | Critical | #security Slack | Immediate |

### On-call rotation

**Current**: Data team handles on-call

**Schedule**: Check #data-team Slack for weekly rotation (or in external on-call tool)

**Response SLA**:
- Critical (dashboard down): <10 minutes
- High (errors >1%, build failed): <30 minutes
- Medium (performance): <1 hour

### Escalation path

```
Detection (automated alert)
  ↓
Data team (#data-team Slack) — <5 min response
  ↓
Acknowledge + start investigation
  ↓
After 15 min if unresolved:
  ↓
Notify backend team (if API issue)
  ↓
After 30 min if unresolved:
  ↓
Escalate to engineering manager
```

### Alert noise prevention

To avoid alert fatigue:

- [ ] Tune thresholds based on historical data (not guesses)
- [ ] Use time-window thresholds: "error rate >1% for 5+ minutes" (not single spike)
- [ ] Combine signals: alert on (errors >1% AND latency >5s) not either alone
- [ ] Silence known maintenance windows
- [ ] Regularly review and disable unused alerts

---

## Dashboard setup

### PostHog monitoring dashboard

Create a custom PostHog dashboard with these queries:

```
Dashboard: "Dashboard Operations Monitoring"

Chart 1: Page Load Time (p95)
- Query: SELECT quantiles(0.95)(properties.duration) 
         FROM events WHERE event = 'dashboard_viewed'
- Refresh: 5 min

Chart 2: Error Rate
- Query: SELECT (count(error=true) / count()) * 100 as error_rate
         FROM events WHERE event = 'dashboard_error'
- Threshold: <0.5% is OK, >1% is alert

Chart 3: Traffic (Page Views)
- Query: SELECT count() FROM events WHERE event = 'dashboard_viewed'
- Time range: last 24 hours, bin by 1 hour

Chart 4: API Response Time
- Query: SELECT quantiles(0.95)(properties.api_response_time)
         FROM events WHERE event = 'api_query'
```

### Sentry monitoring

Monitor at `https://sentry.io/organizations/readmigo/issues/`:

- Set to alert on >5 errors/minute
- Review error patterns daily
- Tag errors by component (e.g., `component:chart`, `component:auth`)

### Checkly synthetic monitoring

Run synthetic heartbeat from `https://app.checklyhq.com/`:

```
Check: Dashboard availability
- URL: https://dashboard.readmigo.com
- Frequency: every 5 minutes
- Alert if: fails 3x in a row
- Notification: #data-team Slack
```

---

**Related**: [SLI / SLO](sli-slo.md) | [Runbooks](runbooks.md) | [Rollback Runbook](rollback.md)
