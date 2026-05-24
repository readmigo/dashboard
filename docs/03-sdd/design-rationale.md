---
title: Design Rationale
phase: sdd
status: active
owner: data-team
last_updated: 2026-05-24
---

# Design Rationale

## Key Decisions & Justification

### 1. react-admin v5 as Primary Framework

**Decision**: Use react-admin instead of custom Next.js/SvelteKit or headless builder.

**Justification**:
- Rapid scaffolding: List/Edit/Show views auto-generated from dataProvider; saves 60% boilerplate
- Built-in auth/i18n/routing: No need to reinvent auth guards or locale switching
- RBAC support: `usePermissions()` hook for role-based features
- Large community & stability: Used by 5000+ projects; long-term maintenance

**Trade-off**:
- Opinionated component structure: Less control over page layouts; harder to customize beyond `sx` props
- Vendor lock-in: Switching frameworks requires rewriting all CRUD pages
- Limited advanced features: No built-in optimistic updates, soft deletes, or denormalization

**Alternative Considered**: Next.js App Router
- Pros: Full control, SSR/ISR, file-based routing
- Cons: Too much setup for CRUD-heavy admin; harder to integrate PostHog; no built-in auth framework

---

### 2. Context API over Redux / Zustand

**Decision**: Use React Context + useState for EnvironmentContext, TimezoneContext, ContentLanguageContext.

**Justification**:
- Simple mental model: 4 independent providers; no reducer complexity
- Zero dependencies: No external store library; smaller bundle
- Sufficient for use case: ~10 top-level state variables; infrequent updates (only env/locale changes)
- Easy to test: No mock store setup; just wrap tests in provider

**Trade-off**:
- Performance: Context triggers re-render of all consumers; no automatic optimization
- No time-travel debugging: Can't inspect state history or undo/redo
- Prop drilling for derived state: If multiple pages need same data, repetition

**Threshold**: If state becomes >20 variables or updates >10x per second, migrate to Zustand (minimal changes needed).

---

### 3. Centralized Design Tokens (brandTokens.ts)

**Decision**: No hardcoded hex values; all colors sourced from `src/theme/brandTokens.ts`.

**Justification**:
- Consistency: Changes in one place propagate everywhere (e.g., brand primary color update)
- Brand fidelity: Designers control tokens; developers cannot deviate
- Dark mode readiness: Easy to swap dark variants when theme adds dark support
- Audit trail: Git history shows color changes and justification

**Enforcement**:
- ESLint rule (or manual review) rejects hardcoded hex values in component files
- `theme.ts` re-exports brandTokens to MUI theme

**Related**: [Design System](https://docs.readmigo.app/02-design/design-system)

---

### 4. Dual Data Sources (REST + PostHog HogQL)

**Decision**: Keep REST API as source-of-truth; use PostHog only for analytics queries.

**Justification**:
- REST for authoritative data: Books, users, orders stored in PostgreSQL; REST API enforces permissions, validation, transactions
- PostHog for behavioral data: Anonymous events, session flows, retention metrics without backend overhead
- Separation of concerns: Operational queries (CRUD) vs. analytical queries (funnels, cohorts)
- Cost optimization: Avoid duplicating event storage in REST database; leverage PostHog's optimized column store

**Trade-off**:
- Integration complexity: Two authentication schemes (JWT for REST, API key for PostHog)
- Data consistency: Slight lag between REST mutation and PostHog event capture
- Query learning curve: HogQL syntax different from SQL; limited IDE support

**Validation**: [Analytics Config](./design-language.md#api-contracts) documents both contract shapes.

---

### 5. Playwright E2E Only (No Unit Tests)

**Decision**: Test at E2E layer via Playwright; defer unit test implementation.

**Justification**:
- Fast feedback: Real browser testing; catches integration bugs (auth, API mocking, routing) early
- Lower maintenance: No need to update mocks when internal component structure changes
- MVP speed: Rapid feature delivery without test infrastructure
- Confidence: E2E tests validate actual user workflows end-to-end

**Trade-off**:
- Slow feedback loop: E2E tests take 5-30 seconds per run (cold start + network mocks)
- Brittle selectors: Relies on text content or test IDs; refactoring component internals risks test breakage
- Low unit coverage: Services, utilities, config logic tested indirectly; bugs in edge cases missed

**Future**: Migrate to unit + E2E hybrid pyramid (see [Coverage Baseline](../04-ut/coverage-baseline.md)).

---

### 6. Environment Switching in Context (not .env)

**Decision**: Store environment choice in localStorage/sessionStorage; switch at runtime via EnvironmentContext.

**Justification**:
- Developer experience: No need to restart dev server; toggle local ↔ production in UI
- Flexible QA testing: Testers can point to staging/production without rebuilding
- Multi-environment support: Easy to add staging, dev, sandbox later

**Risk Mitigation**:
- CustomAppBar shows active environment (local = yellow, production = green)
- Production environment requires explicit confirmation dialog before mutations
- Audit log (optional): Log environment switches with timestamp

---

### 7. MUI v6 + Grid v1 API

**Decision**: Use Material-UI v6 components; enforce Grid v1 (`item xs={12}` API, not v2 `size={12}`).

**Justification**:
- Mature ecosystem: 60+ components, accessibility built-in (WCAG 2.1 AA)
- Enterprise support: Active maintenance; used by major companies
- Design system alignment: Readmigo brand tokens map to MUI theming (`palette`, `typography`, `spacing`)
- Recharts integration: MUI charts play well with Recharts for hybrid dashboards

**Constraint**: Grid v2 `size` prop is newer but Grid v1 is stable; mixing both causes layout bugs.

**Related**: [Brand System](https://docs.readmigo.app/02-design/design-system)

---

### 8. Recharts for Analytics Visualizations

**Decision**: Use Recharts for line/bar/pie charts; avoid heavy libraries like Chart.js or ApexCharts.

**Justification**:
- React-native: Composable React components; plays well with react-admin lifecycle
- Small bundle: ~80KB gzipped; no D3 dependency
- Good defaults: Tooltips, legends, responsive resizing out-of-the-box
- Custom palette support: Easy to use `chartPalette` from brandTokens

**Trade-off**:
- Limited advanced features: No drill-down, limited axis customization, no 3D charts
- Performance: Redraws on every prop change; not optimized for 100k points

**Threshold**: If chart features exceed Recharts capabilities, evaluate Observable Plot or Vega-Lite.

---

## Related ADRs

See [`docs/00-adr/`](https://docs.readmigo.app/00-adr) for comprehensive decision records:

- [ADR-001: Single Page Application Framework Choice](https://docs.readmigo.app/00-adr/001-spa-framework)
- [ADR-002: State Management Strategy](https://docs.readmigo.app/00-adr/002-state-management)
- [ADR-003: Design Token System](https://docs.readmigo.app/00-adr/003-design-tokens)
- [ADR-004: Analytics Integration (PostHog vs. Custom)](https://docs.readmigo.app/00-adr/004-analytics)

---

## Trade-off Analysis Matrix

| Dimension | Winner | Runner-up | Trade-off |
|-----------|--------|-----------|-----------|
| **Framework** | react-admin | Next.js + custom | Opinionated vs. full control |
| **State** | Context API | Zustand | Simplicity vs. performance |
| **Design Tokens** | Centralized (brandTokens.ts) | CSS variables | Enforceability vs. runtime flexibility |
| **Analytics** | Dual (REST + PostHog) | PostHog only | Dual auth complexity vs. single vendor |
| **Testing** | E2E (Playwright) | Unit first (Jest) | Fast feature delivery vs. safety nets |
| **Environment** | Runtime Context | Build-time .env | Dev convenience vs. build determinism |
| **UI Library** | MUI v6 | Headless UI / shadcn | Feature-rich vs. lightweight |
| **Charts** | Recharts | D3.js / ApexCharts | Simplicity vs. advanced customization |

**Key Insight**: Most trade-offs favor **developer velocity** and **simplicity** over **advanced features**. As the product matures and testing requirements grow, investments in unit testing, Zustand state, and custom charts may become justified.

