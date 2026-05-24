---
title: arc42 §7 — Cross-Cutting Concepts
phase: ssad
status: active
owner: data-team
last_updated: 2026-05-24
---

# arc42 §7 — Cross-Cutting Concepts

## Logging

The dashboard uses a global debug logging system initialized in `src/main.tsx`:

| Aspect | Detail |
|---|---|
| API | `window.__DEBUG_LOG__(type, message, data?)` |
| Types | `error`, `log`, `warn`, `data` |
| Storage | Ring buffer of 200 entries in `window.__DEBUG_LOGS__` |
| Capture | Global `onerror`, `onunhandledrejection`, `console.error` override |
| Access | Browser console: `window.__DEBUG_LOGS__` |

All DataProvider requests and responses are logged through this system.

## Monitoring & observability

| Tool | Purpose | Integration point |
|---|---|---|
| PostHog | Product analytics, 11 dashboards | HogQL queries from `src/config/posthog-queries.ts` |
| Sentry | Error tracking, crash reporting | Global error boundary in `src/main.tsx` |
| Checkly | Uptime monitoring | External probe on dashboard.readmigo.com |
| Debug console | Runtime debugging | `window.__DEBUG_LOGS__` accessible in browser |

## Security

| Concern | Implementation |
|---|---|
| Authentication | JWT-based login via `/api/v1/admin/auth/login`; token stored in `sessionStorage` |
| Dev mode bypass | `VITE_AUTH_DISABLED=true` enables auto-login with mock admin (dev only) |
| API authorization | Every request carries `Authorization: Bearer {token}` and `X-Admin-Mode: true` headers |
| Secret exposure | Only `VITE_` prefixed env vars are bundled; API keys not committed (`.env.local` in `.gitignore`) |
| CORS | Dev server proxies `/api` to localhost:3000 to avoid cross-origin issues |

## Internationalization (i18n)

| Aspect | Detail |
|---|---|
| Framework | ra-i18n-polyglot (react-admin i18n provider) |
| UI locales | English (en), Simplified Chinese (zh-Hans), Traditional Chinese (zh-Hant), German (de) |
| Detection | Browser language auto-detection, fallback to English |
| Persistence | `localStorage` key `locale` |
| Content filter | Separate from UI locale — filters API data by language (en/zh/all) via `X-Content-Filter` header |

## Performance

| Strategy | Detail |
|---|---|
| Build | Vite 5 with ES module output, tree shaking, code splitting |
| Development | HMR for instant feedback |
| Charts | Recharts renders SVG; large datasets use pagination |
| Caching | Browser localStorage for preferences (environment, timezone, locale, content filter) |
| CI | pnpm cache + cancel-in-progress concurrency to speed up builds |

## Accessibility (a11y)

| Aspect | Detail |
|---|---|
| Component library | MUI v6 provides built-in ARIA attributes and keyboard navigation |
| Color contrast | Brand token colors designed for WCAG AA contrast ratios |
| Timezone awareness | All dates formatted per user-selected timezone (6 options) |

Related: [06-runtime-view.md](./06-runtime-view.md), [08-tech-debt-risks.md](./08-tech-debt-risks.md)
