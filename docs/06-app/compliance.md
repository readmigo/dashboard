---
title: Compliance
phase: app
status: active
owner: data-team
last_updated: 2026-05-24
---

# Compliance

## Privacy policy mapping

**Scope**: Internal admin tool — not public-facing.

The Dashboard is an **internal-only** operations analytics platform restricted to Readmigo employees and authorized partners. It does not collect user data directly; instead, it queries the PostHog analytics platform.

### Data handling

| Data Type | Source | Recipient | Handling |
|-----------|--------|-----------|----------|
| PostHog analytics events | Readmigo iOS/Android/Web apps | PostHog cloud instance | Displayed in dashboards; internal user IDs filtered |
| User metrics (DAU, retention, etc.) | PostHog queries | Dashboard UI | Aggregated, anonymized metrics only |
| API responses | Readmigo backend API | Dashboard UI | Filtered for internal visibility |

### User data filtering

The Dashboard **excludes** internal test accounts from analytics to prevent skewing metrics:

```
Internal User IDs (always filtered):
- 88952c83-83f1-4bdc-a7a0-85f3c3e4c2ab (iOS multi-device)
- a14b013d-fd4c-4f23-91e0-41e0dcf92417 (Android Pixel 3a)
- 7ca8da67-4861-4267-a1b5-be3b357b438d (Android OnePlus 8Pro)
- 88c99ab9-4f25-52cc-8999-3e58d559ec41 (iOS iPhone 11 Pro Max)
```

See `src/config/analytics-config.ts` for implementation.

### Privacy policy reference

- **Readmigo Privacy Policy**: `https://readmigo.app/privacy` (main website policy applies to Readmigo app users)
- **PostHog Privacy**: Users' data shared with PostHog under Readmigo's PostHog subscription agreement
- **Internal Policy**: Employees agree to Dashboard access as part of onboarding; no separate user consent required

## Age rating

**Not applicable**. The Dashboard is an internal admin tool, not a consumer-facing app or website. It is not published to any app store or rating system.

Access is restricted to employees with valid GitHub credentials.

## GDPR / CCPA

### Applicability

**Limited applicability**: The Dashboard itself does not directly process or store personal data. However, it queries PostHog, which may contain personal data from Readmigo end-users.

### Data processing

| Requirement | Status | Notes |
|-------------|--------|-------|
| **User consent** | Not required | Dashboard users (employees) access data under employment agreement; end-users' consent was obtained when they signed up to Readmigo apps |
| **Data access logs** | No audit trail | PostHog API does not log individual query access; queries are ephemeral |
| **Data retention** | Governed by PostHog | Data deleted per PostHog's retention policy (default: 1 year) |
| **Data deletion requests** | Processed via PostHog API | Support team can request user data deletion through PostHog's UI |
| **Right to access** | Readmigo employees only | Non-employees cannot access the Dashboard |
| **Data export** | Not implemented | Can be added if required for GDPR Subject Access Requests |

### Compliance measures

1. **Access control**: GitHub authentication required; limited to @readmigo.app email domains
2. **No PII exposure**: Dashboard aggregates and anonymizes metrics; no raw user emails or phone numbers displayed
3. **HTTPS encryption**: All traffic over TLS
4. **PostHog DPA**: Readmigo has a Data Processing Agreement with PostHog covering GDPR compliance
5. **Internal data only**: No customer data shared externally; Dashboard outputs are internal only

### CCPA specific

Dashboard does not:
- Sell consumer personal information
- Disclose personal information for a business purpose
- Share data with unaffiliated third parties

Therefore, **CCPA "Do Not Sell/Share" disclosures** do not apply.

## Copyright & licensing

### Dashboard codebase

- **License**: Private (not open-source)
- **Repository**: `github.com/readmigo/dashboard` (private, employees only)
- **Copyright**: Readmigo, Inc. — All rights reserved

### Third-party libraries

All dependencies are licensed and acknowledged:

| Package | License | Usage |
|---------|---------|-------|
| React | MIT | UI framework |
| react-admin | MIT | Admin panel framework |
| MUI (Material UI) | MIT | Component library |
| Vite | MIT | Build tool |
| TypeScript | Apache 2.0 | Language |
| Recharts | MIT | Charting library |
| Playwright | Apache 2.0 | Testing framework |

See `package.json` and `pnpm-lock.yaml` for the complete dependency list.

**License compliance**:
- All MIT and Apache 2.0 licenses are permissive and compatible with commercial use
- No GPL dependencies (which would require source code disclosure)
- License headers are not required in the codebase

### Brand & design assets

- **Readmigo branding** (logo, colors, fonts) — Proprietary, not for external use
- **Design tokens** (src/theme/brandTokens.ts) — Internal only
- **Charts and visualizations** — Data is internal; charts are not licensed separately

---

**Related**: [Secrets Management](../07-pipeline/secrets.md) | [Deployment Guide](../08-deploy/deployment-guide.md)
