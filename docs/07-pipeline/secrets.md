---
title: Secrets Management
phase: pipeline
status: active
owner: data-team
last_updated: 2026-05-24
---

# Secrets Management

Inventory and lifecycle of sensitive credentials used by the Dashboard.

## Secrets inventory

| Secret | Type | Use | Required | Exposure |
|--------|------|-----|----------|----------|
| `VITE_POSTHOG_PERSONAL_API_KEY` | API key | PostHog HogQL queries | Yes | Client-side (public) |
| `VITE_API_URL` | URL | Backend API endpoint | No (default: `https://readmigo-api.fly.dev`) | Client-side (public) |
| `VITE_POSTHOG_HOST` | URL | PostHog instance | No (default: `https://us.posthog.com`) | Client-side (public) |
| `VITE_POSTHOG_PROJECT_ID` | ID | PostHog project | No (default: `312868`) | Client-side (public) |
| `VITE_AUTH_DISABLED` | Flag | Dev-only: skip authentication | No (default: `false`) | Client-side (public) |
| `VITE_PRODUCTION_API_URL` | URL | Production API override | No | Client-side (public) |
| `VITE_PRODUCTION_CONTENT_STUDIO_URL` | URL | Content Studio link | No | Client-side (public) |

### Note on "public" secrets

All `VITE_*` environment variables are **client-side** and embedded in the JavaScript bundle at build time. They are NOT truly secret:

- Any user can inspect network requests and see API URLs
- PostHog Project ID is always public (required for SDK initialization)
- **Only the PostHog Personal API Key should be closely guarded** — it grants full write access to PostHog

## Storage location

### GitHub repository secrets

**Primary storage** for production variables.

**Location**: `Settings → Secrets and variables → Actions`

**Variables stored**:
- `VITE_POSTHOG_PERSONAL_API_KEY` (required)
- `VITE_API_URL` (optional, overrides default)
- `VITE_POSTHOG_HOST` (optional, overrides default)
- `VITE_POSTHOG_PROJECT_ID` (optional, overrides default)
- `VITE_AUTH_DISABLED` (optional, dev mode)

**Access**: Only used by `.github/workflows/` files at build time.

### Local development (.env.local)

**For local development only** — never committed to Git.

Create `.env.local` in project root:

```bash
cp .env.example .env.local
# Edit .env.local with your local values
```

**Example .env.local**:
```
VITE_POSTHOG_PERSONAL_API_KEY=phc_your_key_here
VITE_API_URL=http://localhost:3000
VITE_AUTH_DISABLED=true
```

**Gitignore rule**: `.env.local` is in `.gitignore` — never committed.

### Environment file precedence

| Source | Priority | Scope | Example |
|--------|----------|-------|---------|
| `.env.local` | Highest | Local dev only | `VITE_API_URL=http://localhost:3000` |
| `.env.example` | Low | Template only | `VITE_API_URL=http://localhost:3000` |
| GitHub secrets | Build-time | CI/CD production builds | `VITE_POSTHOG_PERSONAL_API_KEY=phc_...` |
| Vite defaults | Lowest | Hardcoded fallback | `VITE_POSTHOG_HOST=https://us.posthog.com` |

## Rotation policy

### PostHog API key

**Frequency**: Annually or on security incident

**Steps**:

1. Login to PostHog (`https://us.posthog.com`)
2. Go to Account → Personal API Keys
3. Generate new key with scopes: `Dashboard:Write`, `Insight:Read`
4. Copy new key
5. Update `VITE_POSTHOG_PERSONAL_API_KEY` in GitHub repository secrets
6. Update `.env.local` (for local dev)
7. Revoke old key in PostHog
8. Wait ~5 minutes for key change to propagate
9. Test dashboard: verify PostHog queries load correctly

**Documentation**: Keep notes of rotation date in this file or a separate log.

### Other environment variables

- **API_URL**: Change only if backend endpoint moves (rare)
- **PostHog Project ID**: Never changes (project-scoped)
- **PostHog Host**: Change only if migrating PostHog instances (very rare)

## Leak response

### If PostHog API key is leaked

**Timeline**: Immediate action required.

**Steps**:

1. **Revoke immediately**:
   - Login to PostHog
   - Go to Account → Personal API Keys
   - Delete leaked key

2. **Generate replacement**:
   - Create new key with same scopes (`Dashboard:Write`, `Insight:Read`)

3. **Update secrets**:
   - Update GitHub repository secret `VITE_POSTHOG_PERSONAL_API_KEY`
   - Update `.env.local` (local dev)
   - Trigger new CI build: push a dummy commit to `main`

4. **Verify**:
   - Check that dashboard still queries PostHog successfully
   - Monitor PostHog API logs for unauthorized access before revocation time

5. **Audit**:
   - PostHog usage logs: did anyone else use the leaked key?
   - Consider logging in to PostHog to check for unauthorized queries

6. **Document**:
   - Log incident in security/incident tracker
   - Note rotation date and reason

### If GitHub repository is compromised

1. **Emergency plan**:
   - Rotate ALL secrets immediately
   - Review GitHub Actions logs for unauthorized runs
   - Audit repository access logs
   - Contact GitHub support if needed

2. **Actions**:
   - Follow PostHog key leak response above
   - Rotate any other sensitive credentials
   - Review recent commits for malicious code

## Best practices

- **Never commit secrets to Git**: Use `.gitignore` to prevent `.env.local` commits
- **Use GitHub secrets for CI/CD**: Don't embed credentials in workflows or config files
- **Principle of least privilege**: Grant only necessary PostHog permissions (Insight:Read, not Admin)
- **Audit access**: Periodically review who has access to GitHub repository secrets
- **Change on employee departure**: Rotate PostHog key if an employee with access leaves

---

**Related**: [CD Flow](cd.md) | [Compliance](../06-app/compliance.md)
