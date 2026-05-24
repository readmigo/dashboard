---
title: arc42 §1 — Introduction & Goals
phase: ssad
status: active
owner: data-team
last_updated: 2026-05-24
---

# arc42 §1 — Introduction & Goals

## Task statement

Readmigo Dashboard is a real-time operations analytics admin panel for the Readmigo reading platform. It provides the product operations team with multi-dimensional visualizations of user behavior, book performance, subscription revenue, and content statistics, combining PostHog HogQL analytics with CRUD management of platform resources.

The dashboard integrates two data sources — the PostHog data lake (12 query categories, 11 pre-configured dashboards) and the Readmigo REST API — to support both day-to-day operational decisions and long-term growth planning.

## Top 3 quality goals

| Priority | Quality goal | Scenario |
|---|---|---|
| 1 | **Data accuracy** | Analytics numbers match PostHog source data within a 1-minute lag; internal test users (4 accounts) are excluded from all metrics |
| 2 | **Responsiveness** | Dashboard pages load within 3 seconds (p95); PostHog HogQL queries return within 5 seconds |
| 3 | **Reliability** | Dashboard remains functional even when one data source is unavailable; global error boundary catches and logs all failures |

## Stakeholders

| Role | Concern | Interaction |
|---|---|---|
| Operations Manager | Daily KPI review, reading metrics, user growth trends | Daily use of Dashboard, Reading Stats, Daily Report |
| Product Manager | Subscription conversion, feature adoption, onboarding funnels | Weekly review of Subscription Dashboard, Highlight Analytics |
| Content Manager | Book catalog, author management, category curation, booklist creation | CRUD operations on books, authors, booklists, categories, quotes |
| Developer | Debugging, monitoring, cost tracking, environment switching | Service Hub, Cost Management, global debug console |

Related: [03-context-scope.md](./03-context-scope.md), [04-solution-strategy.md](./04-solution-strategy.md)
