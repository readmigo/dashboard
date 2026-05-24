---
title: Release Notes
phase: app
status: active
owner: data-team
last_updated: 2026-05-24
---

# Release Notes

## Current release

**Version**: 0.1.0 (continuous deployment from `main` branch)

**Release date**: Ongoing — automatic deployment on every commit to `main`

### Latest features

- React 18 + Vite 5 SPA with TypeScript
- react-admin v5 admin dashboard framework
- MUI v6 component library with brand design tokens
- PostHog HogQL query integration (12 analytics categories)
- Real-time metrics: DAU, MAU, retention, subscription conversion, revenue
- Recharts visualizations with configurable dashboard layouts
- Internationalization: English, Simplified Chinese, Traditional Chinese (ra-i18n-polyglot)
- Playwright E2E testing framework
- Global debug system: `window.__DEBUG_LOG__()` with 200-entry ring buffer

### Known limitations

- Static SPA only — no server-side rendering
- PostHog API rate limits apply (default: 120 queries/hour)
- Internal tool — not suitable for external user distributions

## Release history

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | Ongoing | Initial release; continuous deployment from `main` branch |

**Deployment model**: Continuous Deployment (CD)

- Every commit to `main` triggers CI/CD pipeline
- `pnpm build` runs TypeScript type check + Vite bundling
- Build artefacts pushed to GitHub Pages / Vercel
- Live at `https://dashboard.readmigo.com` within 2–3 minutes

**Release cadence**: Real-time (no scheduled releases). Changes appear immediately upon merge.

### Previous releases

None — this is the initial version. Dashboard is under active development with continuous deployment.

## Breaking changes

None documented. Version 0.1.0 is the baseline.

### Upgrade path

N/A for initial release. Subsequent versions will document breaking changes in this section.

### Rollback procedure

If a deploy introduces a critical bug:

1. Identify the problematic commit: `git log --oneline main` (check GitHub Actions logs)
2. Revert the commit: `git revert <commit-hash>`
3. Push to `main`: `git push origin main`
4. CI/CD automatically re-deploys the previous stable version

See [Rollback Runbook](../08-deploy/rollback.md) for detailed steps.

---

**Related**: [Packaging & Build Artefacts](packaging.md) | [Deployment Guide](../08-deploy/deployment-guide.md)
