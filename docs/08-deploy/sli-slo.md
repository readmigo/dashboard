---
title: SLI / SLO / Error Budget
phase: deploy
status: active
owner: data-team
last_updated: 2026-05-24
---

# SLI / SLO / Error Budget

Service Level Indicators (SLI), Service Level Objectives (SLO), and error budget tracking for Readmigo Dashboard.

## Service Level Indicators (SLI)

| SLI | Definition | Measurement | Why it matters |
|-----|-----------|-------------|----------------|
| **Page load latency** | Time from user request to first interactive element | Browser Real User Monitoring (RUM) via PostHog | Users perceive responsiveness; slow loads impact adoption |
| **API response time** | Time for PostHog HogQL queries to return results | PostHog query logs | Determines dashboard responsiveness and usability |
| **Error rate** | HTTP 4xx/5xx responses + JavaScript errors | Sentry error count / total requests | Indicates feature failures and broken functionality |
| **Availability** | Uptime of dashboard.readmigo.com endpoint | Checkly synthetic monitoring | Ensures ops team can access analytics when needed |

## Service Level Objectives (SLO)

30-day rolling window targets:

| SLI | SLO Target | Measurement Window | Threshold | Comment |
|-----|------------|-------------------|-----------|---------|
| **Page load latency** | ≤ 3 seconds p95 | 30 days | 95th percentile | Acceptable for internal tool; consumer apps target ≤1s |
| **API response time** | ≤ 2 seconds p95 | 30 days | 95th percentile | PostHog query performance; includes network latency |
| **Error rate** | ≤ 0.5% | 30 days | Ratio of errors to total requests | Allows for occasional errors without violating SLO |
| **Availability** | ≥ 99.9% | 30 days | Minutes: ≤4.3 min downtime | "Three nines" — acceptable for internal operations tool |

## Error budget

Based on 99.9% availability SLO:

| Period | Error budget (downtime) |
|--------|--------------------------|
| Daily | ~8.6 seconds |
| Weekly | ~1 minute |
| Monthly (30 days) | ~4.3 minutes |

**Interpretation**: We can afford 4.3 minutes of unplanned downtime per month while meeting SLO. Once that budget is exhausted, any additional downtime violates SLO and requires incident review.

### Budget tracking

| Month | Incidents | Downtime | Budget used | Status |
|-------|-----------|----------|-------------|--------|
| May 2026 | 0 | 0 min | 0% | ✅ On track |
| (next) | — | — | — | — |

### Budget burn scenarios

- **Failed deploy**: 2–3 min downtime → uses ~50% of monthly budget
- **CDN outage**: 15 min downtime → exceeds budget, requires RCA
- **PostHog API down**: 5–10 min downtime → ~100–150% of budget, triggers incident review

## Monitoring & alerts

### Metrics to track

- **Latency**: PostHog dashboard page views, time-to-interactive metric
- **Errors**: Sentry error rate, JavaScript console errors
- **Availability**: Checkly synthetic heartbeat (ping dashboard every 5 minutes)

### Alert thresholds

| Alert | Trigger | Severity | Action |
|-------|---------|----------|--------|
| **High error rate** | >1% errors for 5 min | Critical | Page on-call engineer |
| **Page load slow** | p95 latency >5s for 10 min | Warning | Investigate PostHog/API |
| **Availability down** | 3 consecutive Checkly failures | Critical | Page on-call, check dashboards.readmigo.com status |
| **API response slow** | PostHog query time >5s for 10 min | Warning | Contact PostHog support |

### SLO compliance reporting

Monthly report generated on the 1st of each month:

- Availability: X.XX% (target: 99.9%)
- Error rate: Y% (target: ≤0.5%)
- Latency p95: Z seconds (target: ≤3s page load, ≤2s API)
- Error budget used: N%
- Incidents: Count, causes, mitigations

**Audience**: Data team, operations team, leadership.

---

**Related**: [Monitoring & Alerting](monitoring.md) | [Rollback Runbook](rollback.md)
